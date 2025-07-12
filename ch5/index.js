function histogram(){
    d3.csv("tweets.csv").then(data => {
        // draw(data, 'favorites')
        // draw(data, "tweets")
        draw(data, "retweets")
    })
}

function violin(){
    var fillScale = d3.scaleOrdinal().range(["#fcd88a", "#cf7c1c", "#93c464"])
    const xScale = d3.scaleLinear().domain([0, 10]).range([0, 10])
    const yScale = d3.scaleLinear().domain([-3, 3]).range([450, 50])
    addYAxis(yScale, 10)

    var normal = d3.randomNormal()
    var sampleData1 = d3.range(100).map(d => normal())
    var sampleData2 = d3.range(100).map(d => normal())
    var sampleData3 = d3.range(100).map(d => normal())

    const histoChart = d3.histogram()
        .domain([ -3, 3 ])
        .thresholds([ -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3 ])
        .value(d => d)

    const area = d3.area()
        .y(d => yScale(d.x0))
        .x0(d => xScale(-1 * d.length))
        .x1(d => xScale(d.length))
        .curve(d3.curveCatmullRom)

    d3.select("svg")
        .append("g")
        .selectAll("g.violin")
        .data([sampleData1, sampleData2, sampleData3])
        .enter()
        .append("g")
        .append("path")
        .attr("class", "violin")
        .attr("transform", (d, i) => `translate(${100 + (i * 100)}, 0)`)
        .attr("d", d => area(histoChart(d)))
        .attr("fill", (d, i) => fillScale(i))
}

function draw(data, key){
    const xExtent = [0, d3.max(data, d => parseInt(d[key]))]
    const { bins, binSize } = getThresholds(xExtent, 5)
    const histoData = getHistoData(data, key, bins)
    const yExtent = [0, d3.max(histoData, d => d.length)]

    const yScale = d3.scaleLinear().domain(yExtent).range([450, 50])
    const xScale = d3.scaleLinear().domain([0, xExtent[1] * 1.5]).range([50, 450])

    addAxes(yScale, xScale, yExtent[1], bins.length * 2)
    
    d3.select("svg")
        .append("g")
        .attr("id", "histogram")
        .selectAll("rect")
        .data(histoData)
        .enter()
        .append("rect")
        .attr("x", (d, i ) => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => { console.log(d.x0, d.x1, xScale(d.x1 - d.x0), xScale(1)); return xScale(1) - 2})
        .attr("height", d => 450 - yScale(d.length))
        .style("stroke", "darkgrey")
}

function getHistoData(data, key, thresholds) {
    const hist = d3.histogram()

    const extent = d3.extent(data, d => parseInt(d[key]))
        
    const histoChart = hist.domain(extent)
        .thresholds(thresholds)
        .value(d => parseInt(d[key]))

    return histoChart(data)
}

function getThresholds(extent, noOfBins){
    const range = extent[1] - extent[0]
    const binSize = parseInt(range / noOfBins) + 1

    const bins = [0]
    let border = 0
    while(border <= extent[1]){
        border += binSize
        bins.push(border)
    }

    return { bins, binSize }
}

function addYAxis(yScale, yTicks){
    const yAxis = d3.axisRight().scale(yScale).tickSize(400).ticks(yTicks)
    
    d3.select("svg")
        .append("g")
        .attr("id", "yAxisG")
        .call(yAxis)
        .attr("transform", "translate(50, 0)")

    d3.select("g#yAxisG")
        .selectAll("line")
        .attr("stroke", "darkgrey")
        .attr("stroke-width", "1")

    d3.select("g#yAxisG")
        .selectAll("text")
        .attr("transform", "translate(15, 0)")

    d3.select("svg")
        .selectAll("path.domain")
        .style("display", "none")
}

function addAxes(yScale, xScale, yTicks = 10, xTicks = 7){
   
    const xAxis = d3.axisBottom().scale(xScale).tickSize(400).ticks(xTicks)
    const yAxis = d3.axisRight().scale(yScale).tickSize(400).ticks(yTicks)

    d3.select("svg")
        .append("g")
        .attr("id", "xAxisG")
        .call(xAxis)
        .attr("transform", "translate(0, 50)")

    d3.select("svg")
        .append("g")
        .attr("id", "yAxisG")
        .call(yAxis)
        .attr("transform", "translate(50, 0)")

    d3.select("#yAxisG")
        .selectAll("text")
        .attr("transform", "translate(10, 0)")

    d3.select("#xAxisG")
        .selectAll("text")
        .attr("transform", "translate(0, 10)")

    d3.select("#yAxisG")
        .selectAll("g.tick")
        .each(function(d) { 
            const line = this.querySelector("line")
            line.style.opacity = 0.3
         })

    d3.select("#xAxisG")
         .selectAll("g.tick")
         .each(function(d) { 
             const line = this.querySelector("line")
             line.style.opacity = 0.3
          })

    d3.select("svg")
        .selectAll("path.domain")
        .style("display", "none")
}


violin()