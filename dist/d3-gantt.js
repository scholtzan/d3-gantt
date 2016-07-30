/**
 * Contains functionality and configuration parameters for drawing Gantt diagrams.
 *
 * @class d3.ganttDiagram
 */
d3.ganttDiagram = {
  /**
   * Default parameters that can be overwritten by the user.
   *
   * @property node {string} id of the element the gantt diagram will be bound to
   * @property width {number} diagram width
   * @property height {number} diagram height
   * @property activities {array} activties that will be displayed on the y axis
   * @property data {array} data points
   * @property endTime {date} maximum timestamp displayed on the x axis
   * @property startTime {date} minimum timestamp (first) displayed on the x axis
   * @property yAxis.width {number} width of the y axis
   * @property xAxis.height {number} height of the x axis
   * @property xAxis.labelFormat {string} format describing how the dates should be formatted
   */
  defaultParameters: {
    node: '#gantt',
    width: 200,
    height: 200,
    activities: [],
    data: [],
    endTime: new Date(),
    startTime: new Date(),

    yAxis: {
      width: 15
    },

    xAxis: {
      height: 30,
      labelFormat: '%H:%M'
    }
  },

  /**
   * Default parameters that cannot be changed by the user.
   *
   * @property elementHeight {number} height of all elements
   */
  diagramParameters: {
    elementHeight: 10
  },


  /**
   * Initializes the gantt diagram.
   *
   * Determines the time domain and sets configuration parameters.
   *
   * @param params {object} user defined parameters that will overwrite the default parameters
   */
  init: function(params) {
    // get and store the user defined parameters
    this.params = d3.ganttDiagram.util.extend(this.defaultParameters, params);

    // determine the time domain
    if (this.params.data.length > 0) {
      this.params.data.sort(function(a, b) {
        return a.end - b.end;
      });

      this.params.endTime = this.params.data[this.params.data.length - 1].end;

      this.params.data.sort(function(a, b) {
        return a.start - b.start;
      });

      this.params.startTime = this.params.data[0].start;
    }
  },


  /**
   * Displays axes and elements.
   */
  draw: function() {
    this.drawXAxis();
    this.drawYAxis();

    // create a separate container in order to enable scrolling on overflow with fixed axes
    var chartContainer = d3.select(this.params.node)
                      .append('div')
                      .attr('class', 'gantt-chart-container')
                      .attr('height', this.params.height)
                      .attr('width', this.params.width)
                      .attr('style', 'left: ' + this.params.yAxis.width + 'px');

    var chartNode = chartContainer.append('svg')
                                  .attr('preserveAspectRatio', 'xMinYMin meet')
                                  .attr('class', 'chart')
                                  .attr('width', this.params.width)
                                  .attr('height', this.params.height);

    // display the elements based on the provided data
    chartNode.selectAll('svg')
             .data(this.params.data).enter()
             .append('g')
             .append('rect')
             .attr('fill', function(elem) {
               if (elem.fillColor)
                  return elem.fillColor;
             })
             .attr('stroke', function(elem) {
               if (elem.strokeColor)
                  return elem.strokeColor;
             })
             .attr('transform', function(elem) {
               return this.elementTranslate(elem);
             }.bind(this))
             .attr('y', 0)
             .attr('height', this.diagramParameters.elementHeight)
             .attr('width', function(elem) {
               var xAxisScale = d3.scaleTime()
                                  .domain([ this.params.startTime, this.params.endTime])
                                  .range([0, this.params.width])
                                  .clamp(true);

               return xAxisScale(elem.end) - xAxisScale(elem.start);
             }.bind(this));
  },


  /**
   * Calculates the x and y position of an element in the diagram.
   *
   * @param elem {object} element data of a data point
   * @return {string} 'translate([x], [y])'
   */
  elementTranslate: function(elem) {
    var yTranslate = d3.scaleBand()
                       .domain(this.params.activities)
                       .range([0, this.params.height]);

    var xTranslate = d3.scaleTime()
                       .domain([ this.params.startTime, this.params.endTime])
                       .range([0, this.params.width])
                       .clamp(true);

    return 'translate(' + xTranslate(elem.start) + ', ' + yTranslate(elem.name) + ')';
  },


  /**
   * Displays the x axis.
   */
  drawXAxis: function() {
    // creating a separate container allows to leave the x axis fixed
    var xAxisNode = d3.select(this.params.node)
                      .append('div')
                      .attr('class', 'gantt-chart-x-axis');

    var xAxisScale = d3.scaleTime()
                       .domain([ this.params.startTime, this.params.endTime])
                       .range([0, this.params.width])
                       .clamp(true);

    var xAxis = d3.axisBottom()
                  .scale(xAxisScale)
                  .tickFormat(d3.timeFormat(this.params.xAxis.labelFormat))
                  .ticks(10);

    var xAxisSvg = xAxisNode.append('svg')
                            .attr('width', this.params.width)
                            .attr('height', this.params.height + this.params.xAxis.height);

    // @todo: rotation
    xAxisSvg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + (this.params.yAxis.width + 1) + ',' + (this.params.height - 1) + ')')
            .transition()
            .call(xAxis);
  },


  /**
   * Displays the y axis.
   */
  drawYAxis: function() {
    // creating a separate container allows to leave the y axis fixed
    var yAxisNode = d3.select(this.params.node)
                      .append('div')
                      .attr('class', 'gantt-chart-y-axis');

    var yAxisScale = d3.scaleBand()
                       .domain(this.params.activities)
                       .range([0, this.params.height]);

    var yAxisSvg = yAxisNode.append('svg')
                            .attr('width', this.params.yAxis.width)
                            .attr('height', this.params.height);

    var yAxis = d3.axisLeft().scale(yAxisScale).tickSize(0);

    this.diagramParameters.elementHeight = yAxisScale.bandwidth();

    yAxisSvg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + (this.params.yAxis.width - 1) + ', 0)')
            .call(yAxis);
  }
};

/**
 * Contains utility functions.
 * @static
 */
d3.ganttDiagram.util = {
  /**
   * Merges attributes of two object.
   * In case of duplicates, the attribute values of the second object will be chosen.
   *
   * @param {object} obj1 - first object
   * @param {object} obj2 - second object
   */
  extend: function(obj1, obj2) {
    var result = {};

    for (var a1 in obj1) {
      result[a1] = obj1[a1];
    }

    for (var a2 in obj2) {
      result[a2] = obj2[a2];
    }

    return result;
  }
};
