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
const bgSelect = document.querySelector('#bg');
bgSelect.selectedIndex = 0;

limitSelect.addEventListener('change', render);
bgSelect.addEventListener('change', render);
orderSelect.addEventListener('change', render);
categorySelect.addEventListener('change', render);

const cate_arr = ['./dataset/shape.json', './dataset/country.json',
  './dataset/city.json', './dataset/datetime.json'];

render();


function render() {
  let idx = 0;
  const limit = limitSelect.selectedIndex + 1;
  const bgColor = bgSelect.options[bgSelect.selectedIndex].value;
  const doShuffle = orderSelect.selectedIndex == 2;
  document.querySelector('#chart').innerHTML = '';

  let dataPath = cate_arr[document.getElementById('category').value];
  // let data = d3.json(dataPath);
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
      data = sort(data, 'value', order).slice(0, limit);
    }
    var json = {'children':data};
  
   
    // var json = {
    //   'children': [
    //     {name: 'Adventure', value: 50},
    //     {name: 'Brand', value: 42},
    //     {name: 'Marketing', value: 38},
    //     {name: 'Consumer', value: 33},
    //     {name: 'Home & Garden', value: 32},
    //     {name: 'Research', value: 26},
    //     {name: 'Mobile', value: 22},
    //     {name: 'Technology', value: 21},
    //     {name: 'Entertainment', value: 17},
    //     {name: 'Digital', value: 15},
    //     {name: 'Consumer Packaging', value: 13},
    //     {name: 'Social Media', value: 13},
    //     {name: 'Finance', value: 12},
    //     {name: 'Science', value: 6},   
    //     {name: 'Parenting', value: 6},
    //     {name: 'Usability', value: 5},
    //     {name: 'Engineering', value: 4},
    //     {name: 'Fun', value: 4},
    //     {name: 'Sports', value: 4},
    //     {name: 'Reading', value: 4},
    //     {name: 'Education', value: 3},
    //     {name: 'Productivity', value: 3},
    //     {name: 'Games', value: 3},
    //     {name: 'Pets', value: 2},
    //     {name: 'Food', value: 1},
    //   ].slice(0, limit)
    // }
  
    if (doShuffle) {
      json.children = _.shuffle(json.children);  
    }
    const values = json.children.map(d => d.value);
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const total = json.children.length;
  
    document.body.style.backgroundColor = bgColor;  
    
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