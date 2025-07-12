function histogram(){
    d3.csv("tweets.csv").then(data => {
        // draw(data, 'favorites')
        // draw(data, "tweets")
        draw(data, "retweets")
    })
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


histogram()