d3.ganttDiagram = {
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

  diagramParameters: {
    elementHeight: 10,
    elementWidth: 10
  },

  init: function(params) {
    this.params = d3.ganttDiagram.util.extend(this.defaultParameters, params);

    if (this.params.data.length > 0) {
      this.params.data.sort(function(a, b) {
        return a.end - b.end;
      });

      this.params.endTime = this.params.data[this.params.data.length - 1].end;

      this.params.data.sort(function(a, b) {
        return a.start - b.start;
      });

      console.log(this.params.data[0].start);

      this.params.startTime = this.params.data[0].start;
    }
  },

  draw: function() {
      this.drawXAxis();
      this.drawYAxis();

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

  // elementWidth: function() {
  //   return (this.params.endTime - this.params.startTime) / 1000 / 60 * this.diagramParameters.width;
  // },

  drawXAxis: function() {
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

  drawYAxis: function() {
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
  },

  redraw: function() {

  }

};

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
