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
   * @property xAxis.label.format {string} format describing how the dates should be formatted
   * @property xAxis.label.rotation {number} rotation angle of the labels
   * @property xAxis.label.dx {string} x shift of the labels
   * @property xAxis.label.dy {string} y shift of the labels
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
      height: 35,
      interval: d3.timeMinute.every(15),
      label: {
        format: '%H:%M',
        rotation: -90,
        dx: '-1em',
        dy: '-1em'
      }
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
    this.initTooltips();

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
    var element = chartNode.selectAll('svg')
             .data(this.params.data).enter()
             .append('g')
             .attr('transform', function(elem) {
               return this.elementTranslate(elem);
             }.bind(this));


    element.append('rect')
           .attr('fill', function(elem) {
             if (elem.fillColor)
                return elem.fillColor;
           })
           .attr('stroke', function(elem) {
             if (elem.strokeColor)
                return elem.strokeColor;
           })
           .attr('height', this.diagramParameters.elementHeight)
           .attr('width', function(elem) {
             return this.elementWidth(elem);
           }.bind(this));

    element.append('text')
           .style('text-anchor', 'middle')
           .attr('transform', function(elem) {
             return this.elementLabelTranslate(elem);
           }.bind(this))
           .text(function(elem) { // show text within elements
             return elem.text;
           });
  },


  /**
   * Calculates the x and y position of an element in the diagram.
   *
   * @param elem {object} element data of a data point
   * @return {string} 'translate([x], [y])'
   */
  elementTranslate: function(elem) {
    var yTranslate = d3.scaleBand()
                       .domain(this.params.activities.map(function(x) { return x.name; }))
                       .range([0, this.params.height]);

    var xTranslate = d3.scaleTime()
                       .domain([ this.params.startTime, this.params.endTime])
                       .range([0, this.params.width])
                       .clamp(true);

    return 'translate(' + xTranslate(elem.start) + ', ' + yTranslate(elem.activity) + ')';
  },


  /**
   * Calculates the width of an element based on the start and end time.
   *
   * @param elem {object} element data
   * @return {number} width of the element
   */
  elementWidth: function(elem) {
    var xAxisScale = d3.scaleTime()
                       .domain([ this.params.startTime, this.params.endTime])
                       .range([0, this.params.width])
                       .clamp(true);

    return xAxisScale(elem.end) - xAxisScale(elem.start);
  },


  /**
   * Calculates the x and y offset of the label within a specific element.
   *
   * @param elem {object} element the label belongs to
   * @return {string} 'translate([x], [y])'
   */
  elementLabelTranslate: function(elem) {
    var yTranslate = d3.scaleBand()
                       .domain(this.params.activities.map(function(x) { return x.name; }))
                       .range([0, this.params.height]);

    return 'translate(' + (this.elementWidth(elem) / 2) + ', ' + (yTranslate.bandwidth() / 2) + ')';
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
                  .tickFormat(d3.timeFormat(this.params.xAxis.label.format))
                  .ticks(this.params.xAxis.interval);

    var xAxisSvg = xAxisNode.append('svg')
                            .attr('width', this.params.width)
                            .attr('height', this.params.height + this.params.xAxis.height);

    xAxisSvg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + (this.params.yAxis.width + 1) + ',' + (this.params.height - 1) + ')')
            .transition()
            .call(xAxis)
            .selectAll('text')
              .style('text-anchor', 'end')
              .attr('dx', this.params.xAxis.label.dx)
              .attr('dy', this.params.xAxis.label.dy)
              .attr('transform', 'rotate(' + this.params.xAxis.label.rotation + ')');
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
                       .domain(this.params.activities.map(function(x) { return x.name; }))
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
  },


  /**
   * Creates the tooltips for the y axis to show the activity descriptions.
   */
  initTooltips: function() {
    var activities = this.params.activities;

    // create one div that will be the tooltip
    var tooltip = d3.select(this.params.node)
                  	.append('div')
                    .attr('class', 'y-axis-tooltip')
                  	.style('position', 'absolute')
                  	.style('z-index', '10')
                  	.style('visibility', 'hidden');

    // when hovering over a y axis label, show the div and move to the correct position and update the displayed description
    d3.selectAll('.y .tick')
      .on('mouseover', function(){
        return tooltip.style('visibility', 'visible');
      })
      .on('mousemove', function(d){
        return tooltip.style('top', event.pageY + 10 + 'px').style('left', event.pageX + 10 + 'px')
                      .text(activities.find(function(x) { return x.name == d; }).description);
      })
	    .on('mouseout', function(){
        return tooltip.style('visibility', 'hidden');
      });
  }
};
