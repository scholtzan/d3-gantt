// RequireJS, CommonJS compatibility
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['d3', 'jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function(d3) {
      d3.ganttChart = factory(d3);
      return d3.ganttChart;
    };
  } else {
    factory(d3, $);
  }
}(function (d3, $) {

  /**
   * Contains functionality and configuration parameters for drawing gantt charts.
   *
   * @class d3.ganttChart
   */
  d3.ganttChart = {
    /**
     * Default parameters that can be overwritten by the user.
     *
     * @property node {string} ID of the element the gantt chart will be bound to
     * @property width {number} chart width
     * @property height {number} chart height
     * @property activities {array} activties that will be displayed on the y axis
     * @property data {array} data points
     * @property endTime {date} maximum timestamp displayed on the x axis
     * @property startTime {date} minimum timestamp (first) displayed on the x axis
     * @property yAxis.width {number} width of the y axis
     * @property yAxis.dynamicHeight {boolean} false if `height` is used as the chart height;
                                               true if elements should have a specific height and the chart height should be calculated accordingly
                                               (in this case property `height` is ignored)
     * @property yAxis.elementHeight {number} height of the elements if `yAxis.dynamicHeight` is true
     * @property xAxis.height {number} height of the x axis
     * @property xAxis.dynamicWidth {number} false if `width` is used as the chart width;
                                             true if ticks on the x axis should have a specific distance
                                             (in this case `width` is ignored)
     * @property xAxis.tickDistance {number} distance between two ticks if `dynamicWidth` is true
     * @property xAxis.interval {function} d3 interval function that determines the time interval on the x axis
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
        width: 15,
        dynamicHeight: true,
        elementHeight: 50
      },

      xAxis: {
        height: 35,
        dynamicWidth: true,
        tickDistance: 50,
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
     * Initializes the gantt chart.
     *
     * Determines the time domain and sets configuration parameters.
     *
     * @param params {object} user defined parameters that will overwrite the default parameters
     */
    init: function(params) {
      // get and store the user defined parameters
      this.params = $.extend(true, this.defaultParameters, params);

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
      // re-calculate the height of the diagram if explicit height of elements should be used
      if (this.params.yAxis.dynamicHeight) {
        this.params.height = this.params.yAxis.elementHeight * this.params.activities.length;
      }

      // re-calculate the width of the diagram if explicit distance between ticks should be used
      if (this.params.xAxis.dynamicWidth) {
        var numberOfTicks = this.params.xAxis.interval.range(this.params.startTime, this.params.endTime).length;
        this.params.width = this.params.xAxis.tickDistance * numberOfTicks;
      }

      this.drawXAxis();
      this.drawYAxis();
      this.initTooltips();

      // create a separate container in order to enable scrolling on overflow with fixed axes
      var chartContainer = d3.select(this.params.node)
                             .attr('class', 'gantt-chart')
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
             .attr('height', this.params.yAxis.elementHeight)
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
      return 'translate(' + this.xAxisScale()(elem.start) + ', ' + this.yAxisScale()(elem.activity) + ')';
    },


    /**
     * Returns the time scale of the x axis.
     * @return {object} d3.scaleTime
     */
    xAxisScale: function() {
      return d3.scaleTime()
               .domain([ this.params.startTime, this.params.endTime])
               .range([0, this.params.width])
               .clamp(true);
    },


    /**
     * Returns the scale of activities represented by the y axis.
     * @return {object} d3.scaleBand
     */
    yAxisScale: function() {
      return d3.scaleBand()
               .domain(this.params.activities.map(function(x) { return x.name; }))
               .range([0, this.params.height]);
    },


    /**
     * Calculates the width of an element based on the start and end time.
     *
     * @param elem {object} element data
     * @return {number} width of the element
     */
    elementWidth: function(elem) {
      return this.xAxisScale()(elem.end) - this.xAxisScale()(elem.start);
    },


    /**
     * Calculates the x and y offset of the label within a specific element.
     *
     * @param elem {object} element the label belongs to
     * @return {string} 'translate([x], [y])'
     */
    elementLabelTranslate: function(elem) {
      return 'translate(' + (this.elementWidth(elem) / 2) + ', ' + (this.yAxisScale().bandwidth() / 2) + ')';
    },


    /**
     * Displays the x axis.
     */
    drawXAxis: function() {
      var diagramNode = this.params.node;

      // creating a separate container allows to leave the x axis fixed
      var xAxisNode = d3.select(this.params.node)
                        .append('div')
                        .attr('class', 'gantt-chart-x-axis');

      // scroll handling with fixed axis
      var xAxisElement = $(this.params.node).find('.gantt-chart-x-axis');

      xAxisElement.scroll(function(e) {
        var ganttContainter = $(diagramNode).find('.gantt-chart-container');
        ganttContainter.scrollLeft(xAxisElement.scrollLeft());
      });

      // show x axis
      var xAxis = d3.axisBottom()
                    .scale(this.xAxisScale())
                    .tickFormat(d3.timeFormat(this.params.xAxis.label.format))
                    .ticks(this.params.xAxis.interval);

      var xAxisSvg = xAxisNode.append('svg')
                              .attr('width', this.params.width + this.params.yAxis.width)
                              .attr('height', this.params.height + this.params.xAxis.height);

      xAxisSvg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(' + this.params.yAxis.width + ',' + this.params.height + ')')
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

      // handle horizontal scrolling
      var diagramNode = this.params.node;
      var yAxisElement = $(this.params.node).find('.gantt-chart-y-axis');

      yAxisElement.scroll(function(e) {
        var ganttContainter = $(diagramNode).find('.gantt-chart-container');
        ganttContainter.scrollTop(xAxisElement.scrollTop());
      });

      // show y axis
      var yAxisSvg = yAxisNode.append('svg')
                              .attr('width', this.params.yAxis.width)
                              .attr('height', this.params.height);

      var yAxis = d3.axisLeft().scale(this.yAxisScale()).tickSize(0);

      this.params.yAxis.elementHeight = this.yAxisScale().bandwidth();

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
      var node = $(this.params.node)[0];

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
          return tooltip.style('top', d3.mouse(node)[1] + 10 + 'px').style('left', d3.mouse(node)[0] + 10 + 'px')
                        .text(activities.find(function(x) { return x.name == d; }).description);
        })
  	    .on('mouseout', function(){
          return tooltip.style('visibility', 'hidden');
        });
    }
  };
}));
