# D3 Gantt Chart

Gantt chart implementation with D3.

Some features include:
* Explicit or dynamic width and height of chart
* Coloring and styling of individual elements
* Frozen Y-axis when scrolling within the chart
* Y-axis tooltips
* RequireJS compatibility


## Usage

```javascript
// Create a new Gantt chart
var gantt = Object.create(d3.ganttChart);

// Configure the chart and add data
gantt.init({
  // ID of the HTML element that will contain the Gantt chart
  node: '#gantt-chart',

  // Y-axis values; description contains the text shown as tooltip when hovering over the Y-axis labels
  activities: [{name: 'John', description: "John's schedule"},
               {name: 'Bob'},
               {name: 'Jane', description: "Jane's schedule"}],

  // data to describe the elements             
  data: [
    { activity: 'John', text: 'Work', fillColor: 'rgb(200, 200, 200)', start: new Date('2016-06-06 07:00:00'), end: new Date('2016-06-06 15:00:00') },
    { activity: 'Jane', text: 'Work', fillColor: 'rgb(200, 100, 100)', start: new Date('2016-06-06 09:00:00'), end: new Date('2016-06-06 17:30:00') },
    { activity: 'Bob', text: 'School', fillColor: 'rgb(200, 200, 100)', start: new Date('2016-06-06 08:00:00'), end: new Date('2016-06-06 14:30:00') },
    { activity: 'Bob', text: 'Soccer', fillColor: 'rgb(200, 200, 100)', start: new Date('2016-06-06 15:00:00'), end: new Date('2016-06-06 16:30:00') }
  ],

  xAxis: {
    interval: d3.timeHour.every(1)
  },

  yAxis: {
    width: 50
  }
})

// Show chart
gantt.draw();
```

## Dependencies

* [D3 (Version 4)](https://d3js.org/)
* [jQuery](https://jquery.com/)


## License

The MIT License (MIT)

Copyright (c) 2016 Anna Scholtz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
