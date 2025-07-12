
function boxPlot(){
    d3.csv('data.csv').then(data => {
        const yExtent = d3.extent(data, d => d.median)
        const xExtent = d3.extent(data, d => d.day)
    
        const yScale = d3.scaleLinear().domain([0, yExtent[1] * 2.5]).range([450, 50])
        const xScale = d3.scaleLinear().domain([0, parseInt(xExtent[1]) + 1]).range([50, 450])
    
        addAxes(yScale, xScale)    
        addBoxPlot(data, yScale, xScale)
    })  
}

function scatterPlot(){
    d3.csv('data.csv').then(data => {
        const yExtent = d3.extent(data, d => d.median)
        const xExtent = d3.extent(data, d => d.day)
    
        const yScale = d3.scaleLinear().domain([0, yExtent[1] * 2]).range([450, 50])
        const xScale = d3.scaleLinear().domain([0, parseInt(xExtent[1]) + 1]).range([50, 450])
    
        addAxes(yScale, xScale)    
        addScatter(data, yScale, xScale)
    })
}

function lineChart(){
    d3.csv("tweets.csv").then(data => {
        const dayExtent = d3.extent(data, d => parseInt(d.day))
        const tweetExtent = d3.extent(data, d => parseInt(d.tweets))
        const retweetExtent = d3.extent(data, d => parseInt(d.retweets))
        const favoriteExtent = d3.extent(data, d => parseInt(d.favorites))

        const max = Math.max(tweetExtent[1], retweetExtent[1], favoriteExtent[1])

        const yScale = d3.scaleLinear().domain([0, parseInt(max) * 1.2]).range([450, 50])
        const xScale = d3.scaleLinear().domain([0, parseInt(dayExtent[1]) + 1]).range([50, 450])

        addAxes(yScale, xScale, 10, 10)
        addTweetPoints(data, yScale, xScale)
        addLines(data, yScale, xScale)

    })
}

function stackedAreaChart(){
    d3.csv("movies.csv").then(data => {
        let max = 0;
        const stackedData = []
        data.forEach(item => {
            let total = 0
            const stackedItem = {}
            Object.keys(item).forEach(key => {
                if(key !== 'day'){
                    total += parseInt(item[key])
                    stackedItem[key] = total
                } else {
                    stackedItem[key] = item[key]
                }
            })

            stackedData.push(stackedItem)
            if(total > max){
                max = total
            }
        })

        const xExtent = d3.extent(stackedData, d => d.day)
        const xScale = d3.scaleLinear().domain([1, parseInt(xExtent[1]) + 1]).range([50, 450])
        const yExtent = [0, max]
        const yScale = d3.scaleLinear().domain([0, parseInt(yExtent[1]) * 1.5]).range([450, 50])

        addAxes(yScale, xScale, 10, 10)

        const fillScale = d3.scaleOrdinal()
            .domain(["titanic", "avatar", "akira", "frozen", "deliverance", "avengers"])
            .range(["#fcd88a", "#cf7c1c", "#93c464", "#75734F", "#5eafc6", "#41a368"])
        
        let previousKey
        Object.keys(stackedData[0]).forEach((key, index) => {
            if(key !== 'day'){
                const yLine = d3.area()
                    .x(d => xScale(d.day))
                    .y0(d => previousKey === 'day' ? yScale(0): yScale(d[previousKey] || 0) )
                    .y1(d => yScale(d[key]))
                    .curve(d3.curveMonotoneX)
                    
                    addLine(stackedData, yLine, fillScale(key))
            }
            previousKey = key
        })
    })
}

function addLine(data, line, color){
    d3.select("svg")
        .append("path")
        .attr("d", line(data))
        .attr("fill", color)
        .attr("stroke", 'darkgrey')
        .attr("stroke-width", "1")
}

function addLines(data, yScale, xScale){
    const tweetLine = d3.line()
        .y(d => yScale(d.tweets))
        .x(d => xScale(d.day))

    const favoritesLine = d3.line()
        .y(d => yScale(d.favorites))
        .x(d => xScale(d.day))

    const retweetLine = d3.line()
        .y(d => yScale(d.retweets))
        .x(d => xScale(d.day))

    d3.select("svg")
        .append("path")
        .attr("d", tweetLine(data))
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", "2")

    d3.select("svg")
        .append("path")
        .attr("d", favoritesLine(data))
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", "2")

    d3.select("svg")
        .append("path")
        .attr("d", retweetLine(data))
        .attr("fill", "none")
        .attr("stroke", "yellow")
        .attr("stroke-width", "2")
}

function addTweetPoints(data, yScale, xScale){
    d3.select("svg")
        .append("g")
        .selectAll("g.tweet")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "tweet")
        .attr("cx", d => xScale(d.day))
        .attr("cy", d => yScale(d.tweets))
        .attr("r", 5)
        .style("fill", 'blue')
        .style("stroke", "none")

    d3.select("svg")
        .append("g")
        .selectAll("g.tweet")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "tweet")
        .attr("cx", d => xScale(d.day))
        .attr("cy", d => yScale(d.favorites))
        .attr("r", 5)
        .style("fill", 'green')
        .style("stroke", "none")

    d3.select("svg")
        .append("g")
        .selectAll("g.tweet")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "tweet")
        .attr("cx", d => xScale(d.day))
        .attr("cy", d => yScale(d.retweets))
        .attr("r", 5)
        .style("fill", 'yellow')
        .style("stroke", "none")
}

function addBoxPlot(data, yScale, xScale){
    d3.select("svg")
        .append("g")
        .attr("id", "chartArea")
        .selectAll("g#boxPlot")
        .data(data)
        .enter()
        .append('g')
        .attr("id", "boxPlot")


    d3.select("g#chartArea")
        .selectAll("g#boxPlot")
        .each(function(d, i){
            d3.select(this)
                .append("line")
                .attr("class", "range")
                .attr("x1", xScale(d.day))
                .attr("y1", yScale(d.min))
                .attr("x2", xScale(d.day))
                .attr("y2", yScale(d.max))
                .style("stroke", "darkgray")
                .style("stroke-width", "4px")

            d3.select(this)
                .append("rect")
                .attr("class", "box")
                .attr("x", xScale(d.day) - 10)
                .attr("y", yScale(d.q3))
                .attr("width", 20)
                .attr("height", yScale(d.q1) - yScale(d.q3))
                .attr("fill", 'white')
                .attr("stroke", "black")
                .attr("stroke-width", '1px')

            d3.select(this)
                .append("line")
                .attr("x1", xScale(d.day) - 10)
                .attr("y1", yScale(d.max))
                .attr("x2",  xScale(d.day) + 10)
                .attr("y2", yScale(d.max))
                .attr("stroke", "darkgray")
                .attr("stroke-width", '4px')

            d3.select(this)
                .append("line")
                .attr("x1", xScale(d.day) - 10)
                .attr("y1", yScale(d.min))
                .attr("x2",  xScale(d.day) + 10)
                .attr("y2", yScale(d.min))
                .attr("stroke", "darkgray")
                .attr("stroke-width", '4px')

            d3.select(this)
                .append("line")
                .attr("x1", xScale(d.day) - 10)
                .attr("y1", yScale(d.median))
                .attr("x2",  xScale(d.day) + 10)
                .attr("y2", yScale(d.median))
                .attr("stroke", "darkgray")
                .attr("stroke-width", '4px')
        })
}

function addScatter(data, yScale, xScale){
    d3.select("svg")
        .append("g")
        .attr("id", "chartArea")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.day))
        .attr("cy", d => yScale(d.median))
        .attr("r", 5)
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

stackedAreaChart()