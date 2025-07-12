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

function pieChart(){
    const pie = d3.pie().value(d => d.value)
    const data = [{ value: 1, id: 1},{value: 2, id: 2},{value: 3, id: 3}]
    const pieData = pie(data)

    const fillScale = d3.scaleOrdinal()
        .range(["#fcd88a", "#cf7c1c", "#93c464", "#75734F"])

    const arc = d3.arc()
    arc.innerRadius(50)
    arc.outerRadius(100)

    d3.select("svg")
        .append("g")
        .attr("id", 'pieChart')
        .attr("transform", "translate(250, 250)")
        .selectAll("path.pieArc")
        .data(pieData)
        .enter()
        .append("path")
        .attr("class", "pieArc")
        .attr("d", d => arc(d))
        .attr("fill", (d, i) => fillScale(i))
        .attr("stroke", d => "black")
        .transition().duration(1000)

    d3.select("g#pieChart").on("click", function(){
        const newPieData = pie([ {value: 6, id: 4}, { value: 7, id: 5}])
        const paths = d3.select(this)
            .selectAll("path.pieArc")
            .data(newPieData, d => d.id)

            paths.exit().remove()

            paths.enter()
            .append("path")
            .attr("class", "pieArc")
            .attr("fill", (d, i) => fillScale(i))
            .attr("stroke", "black")
            .attr("d", arc)
            .each(function(d) { this._current = d }) // store the initial state
            .merge(paths)
            .transition()
            .duration(30000)
            .attrTween("d", function(d) {
              const interpolate = d3.interpolate(this._current, d);
              this._current = interpolate(1);
              return t => arc(interpolate(t));
            });
    })
}

function stackedChart(){
    d3.csv("movies.csv").then(data => {
        const maxY = d3.max(data, d => d3.sum(Object.values(d), a => parseInt(a)))
        const maxX = d3.max(data.map(d => d.day), d => parseInt(d)) + 1
        const yExtent = [0, maxY]
        const xExtent = [0, maxX]


        const movies = Object.keys(data[0]).filter(d => d != 'day')

        const fillScale = d3.scaleOrdinal()
            .domain(movies)
            .range(["#fcd88a", "#cf7c1c", "#93c464", "#75734F", "#5eafc6", "#41a368"])

        const yScale = d3.scaleLinear().domain(yExtent).range([450, 50])
        const xScale = d3.scaleLinear().domain(xExtent).range([50, 450])

        addAxes(yScale, xScale, 10, 10)

        const stackArea = d3.area()
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .x(d => xScale(parseInt(d.data.day)))

        const stack = d3.stack()
            .keys(movies)

        d3.select("svg")
            .selectAll("path.area")
            .data(stack(data))
            .enter()
            .append("g")
            .attr("class", "stack")
            .each(function(stack, i){
                d3.select(this)
                    .selectAll("rect")
                    .data(stack)
                    .enter()
                    .append("rect")
                    .attr("x", (d, i) => xScale(d.data.day) - 15)
                    .attr("y", d => yScale(d[1]))
                    .attr("width", d => 30)
                    .attr("height", d => {
                        return yScale(d[0]) - yScale(d[1])
                    })
                    .attr("fill", (d, i)=> {
                        return fillScale(stack.key)
                    })
            })
            
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
        .attr("width", d => xScale(1) - 2)
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


stackedChart()