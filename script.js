const defaultLimit = 20;

// setup controls
const satInput = document.querySelector('#sat');
const lumInput = document.querySelector('#lum');
const limitSelect = document.querySelector('#limit');
const orderSelect = document.querySelector('#order');
const categorySelect = document.querySelector('#category');
const options = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
options.forEach((val, i) => limitSelect.options[i] = new Option(val));
limitSelect.selectedIndex = defaultLimit - 1;


limitSelect.addEventListener('change', render);
orderSelect.addEventListener('change', render);
categorySelect.addEventListener('change', render);

const cate_arr = ['./dataset/shape.json', './dataset/country.json',
  './dataset/city.json', './dataset/datetime.json'];
const cat = ['shape', 'country', 'city', 'datetime'];

render();

function render() {
  draw();
  let idx = 0;
  const limit = limitSelect.selectedIndex + 1;
  const doShuffle = orderSelect.selectedIndex == 2;
  document.querySelector('#chart').innerHTML = '';

  let dataPath = cate_arr[document.getElementById('category').value];
  let order = document.getElementById('order').value;

  d3.json(dataPath, function(data){
    
    for (var i=0; i<data.length; i++){
      data[i]['value'] = parseInt(data[i]['value']);
    }

    function sort(arr, key, way){
      return arr.sort(function(a, b){
        var x =  a[key]; var y =  b[key];
        if(way == 1){return ((x < y) ? -1 : ((x > y) ? 1 : 0));}
        else{ return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
      });
    }

    if(order != 2){
      data = sort(data, 'value', order);
    }

    if(doShuffle){
      data = _.shuffle(data);
    }

    data = data.slice(0, limit);
    
    var json = {'children':data};
    const values = json.children.map(d => d.value);
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const total = json.children.length;
  
    
    var diameter = 600,
        color = d3.scaleOrdinal(d3.schemeCategory20c);
  
    var bubble = d3.pack()
      .size([diameter, diameter])
      .padding(0);
  
    var tip = d3.tip()
      .attr('class', 'd3-tip-outer')
      .offset([-38, 0])
      .html((d, i) => {
        const item = json.children[i];
        const color = getColor(i, values.length);
        return `<div class="d3-tip" style="background-color: ${color}">${item.name} (${item.value})</div>
        <div class="d3-stem" style="border-color: ${color} transparent transparent transparent"></div>`;
      })
    
      
    var margin = {
      left: 25,
      right: 25,
      top: 25,
      bottom: 25
    }
  
    var svg_bbchart = d3.select('#chart').append('svg')
      .attr('viewBox','0 0 ' + (diameter + margin.right) + ' ' + diameter)
      .attr('width', (diameter - margin.right))
      .attr('height', diameter)
      .attr('class', 'chart-svg');
  
    var root = d3.hierarchy(json)
      .sum(function(d) { return d.value; });
    bubble(root);
  
    var node = svg_bbchart.selectAll('.node')
      .data(root.children)
      .enter()
      .append('g').attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + d.x + ' ' + d.y + ')'; })
      .append('g').attr('class', 'graph');
  
    node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", getItemColor)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
  
    node.call(tip);
      
    node.append("text")
      .attr("dy", "0.2em")
      .style("text-anchor", "middle")
      .style('font-family', 'Roboto')
      .style('font-size', getFontSizeForItem)
      .text(getLabel)
      .style("fill", "#ffffff")
      .style('pointer-events', 'none');
  
    node.append("text")
      .attr("dy", "1.3em")
      .style("text-anchor", "middle")
      .style('font-family', 'Roboto')
      .style('font-weight', '100')
      .style('font-size', getFontSizeForItem)
      .text(getValueText)
      .style("fill", "#ffffff")
      .style('pointer-events', 'none');  
      
    function getItemColor(item) {
      return getColor(idx++, json.children.length);
    }
    function getColor(idx, total) {
      const colorList = ['F05A24','EF4E4A','EE3F65','EC297B','E3236C','D91C5C','BC1E60','9E1F63','992271','952480','90278E','7A2A8F','652D90','502980','3B2671','262261','27286D','292D78','2A3384','2B388F','2A4F9F','2965AF','277CC0','2692D0','25A9E0'];
      const colorLookup = [
        [0,4,10,18,24],
        [0,3,6,9,11,13,15,18,20,24],
        [0,3,4,6,7,9,11,13,14,15,17,18,20,22,24],
        [0,2,3,4,6,7,8,9,11,12,13,14,15,17,18,19,20,22,23,24],
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
      ];  
      for (const idxList of colorLookup) {
        if (idxList.length >= total) {
          return '#' + colorList[idxList[idx]];
        }
      }
    }
  
    function getLabel(item) {
      if (item.data.value < max / 3.3) {
        return '';
      }
      return truncate(item.data.name);
    }
    function getValueText(item) {
      if (item.data.value < max / 3.3) {
        return '';
      }
      return item.data.value;
    }
    function truncate(label) {
      const max = 11;
      if (label.length > max) {
        label = label.slice(0, max) + '...';
      }
      return label;
    }
    function getFontSizeForItem(item) {
      return getFontSize(item.data.value, min, max, total);
    }
    function getFontSize(value, min, max, total) {
      const minPx = 6;
      const maxPx = 15;
      const pxRange = maxPx - minPx;
      const dataRange = max - min;
      const ratio = pxRange / dataRange;
      const size = Math.min(maxPx, Math.round(value * ratio) + minPx);
      return `${size}px`;
    }
    
  });
}



function getRandom(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
};


b1 = '.billboard1 h1'
b2 = '.billboard2 h1'
b3 = '.billboard3 h1'



d3.csv("./dataset/comments.csv")
  .get(function(data) {

    "use strict";
    (function () {
        function getBillboardWidth(billboard) {
            return document.querySelector(billboard).offsetWidth;
        }
        function getWindowWidth() {
            return window.innerWidth;
        }
        function setBillboardContent(billboard) {
            document.querySelector(billboard).textContent = data[getRandom(0, data.length-1)].comments;
        }
        function startBillboard() {
            
            let billboard1 = document.querySelector(b1);
            let billboard2 = document.querySelector(b2);
            let billboard3 = document.querySelector(b3);

            let initLeft1 = getWindowWidth();
            let initLeft2 = getWindowWidth();
            let initLeft3 = getWindowWidth();
            
            let speed1 = getRandom(1000, 2200) / 1000;
            let speed2 = getRandom(1000, 2200) / 1000;
            let speed3 = getRandom(1000, 2200) / 1000;
            

            let timer1 = setInterval(() => {
                if (initLeft1 < getBillboardWidth(b1) * -1) {
                    initLeft1 = getWindowWidth();
                    setBillboardContent(b1);
                    speed1 = getRandom(1000, 2200) / 1000;
                }
                initLeft1 -= speed1;
                billboard1.style.left = initLeft1 + "px";
            }, 10);
          
            let timer2 = setInterval(() => {
                if (initLeft2 < getBillboardWidth(b2) * -1) {
                    initLeft2 = getWindowWidth();
                    setBillboardContent(b2);
                    speed2 = getRandom(1000, 2200) / 1000;
                }
                initLeft2 -= speed2;
                billboard2.style.left = initLeft2 + "px";
            }, 10);
 
            let timer3 = setInterval(() => {
              if (initLeft3 < getBillboardWidth(b3) * -1) {
                  initLeft3 = getWindowWidth();
                  setBillboardContent(b3);
                  speed3 = getRandom(1000, 2200) / 1000;
              }
              initLeft3 -= speed3;
              billboard3.style.left = initLeft3 + "px";
            }, 10);

        }
        setBillboardContent(b1);
        setBillboardContent(b2);
        setBillboardContent(b3);
        startBillboard();
    })();

  });


var flipper = false;

$('#icon').mouseenter(function() {
  clearTimeout(flipper);
  $(this).addClass('hover')});
  
$('#icon').mouseleave(function() {
  flipper = setTimeout(function() {
    $('#icon').removeClass('hover')
  }, 1700)
})


// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;



// append the svg object to the body of the page
var svg = d3.select("#bar")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


d3.csv("./dataset/new.csv", function(data) {
  



// Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
// Its opacity is set to 0: we don't see it by default.
tooltip = d3.select("#bar")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")
})

// A function that change this tooltip when the user hover a point.
// Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
mouseover = function(d) {
  tooltip
    .style("opacity", 1)
}

 mousemove = function(d) {
  tooltip
    .html("The exact value of<br>the Ground Living area is: " + d['duration'])
    .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    .style("top", (d3.mouse(this)[1]) + "px")
}

// A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
mouseleave = function(d) {
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
}

function draw(){
  // var catt = cat[document.getElementById('category').value];
 
  d3.csv("./dataset/new.csv", function(data) {
    
    d3.selectAll('.bar circle').remove();
    d3.selectAll("#x_axis").remove();
    d3.selectAll("#y_axis").remove();
    var catt = cat[document.getElementById('category').value];
    // Add X axis
    var x = d3.scaleBand()
      .domain(data.map(function(d) { return d[catt]; }))
      .range([ 0, width ]);
    
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .attr("id", "x_axis");
    
    
    // Add Y axis
    var y = d3.scaleLinear()
      .range([ height, 0])
      .domain([0, d3.max(data, function(d) {return d['duration']; })]);
    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("id", "y_axis");

    

    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(data.filter(function(d,i){return i<50})) // the .filter part is just to keep a few dots on the chart, not all of them
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d[catt]); } )
        .attr("cy", function (d) { return y(d['duration']); } )
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .style("opacity", 0.3)
        .style("stroke", "white")
      .on("mouseover", mouseover )
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave )
  
  })
  
}