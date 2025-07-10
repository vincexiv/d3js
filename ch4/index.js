d3.csv('data.csv').then(data => {
    const yExtent = d3.extent(data, d => d.median)
    const xExtent = d3.extent(data, d => d.day)

    const yScale = d3.scaleLinear().domain([0, yExtent[1] * 2]).range([450, 50])
    const xScale = d3.scaleLinear().domain([0, parseInt(xExtent[1]) + 1]).range([50, 450])

    addAxes(yScale, xScale)    
    // addScatter(data, yScale, xScale)
    addBoxPlot(data, yScale, xScale)
    
})

function addBoxPlot(data, yScale, xScale){
    d3.select("svg")
        .append("g")
        .attr("id", "chartArea")
        .selectAll("g#box")
        .data(data)
        .enter()
        .append('g')
        .attr("id", "box")


    d3.select("g#chartArea")
        .selectAll("g#box")
        .each(function(d, i){
            const median = d.median
            const min = d.min
            const max = d.max
            const q1 = d.q1
            const q3 = d.q3

            d3.select(this)
                .append("line")
                .attr("x1", xScale(d.day))
                .attr("y1", yScale(d.min))
                .attr("x2", xScale(d.day))
                .attr("y2", yScale(d.max))
                .style("stroke", "darkgray")
                .style("stroke-width", "4px")

                // console.log({day: d.day, min, max, q1, q3, iq: parseInt(q3) - parseInt(q1), height: yScale(parseInt(q1) - parseInt(q3))})
            d3.select(this)
                .append("rect")
                .attr("x", xScale(d.day) - 10)
                .attr("y", yScale(d.q3))
                .attr("width", 20)
                .attr("height", yScale(d.q1) - yScale(d.q3))
                .attr("fill", 'white')
                .attr("stroke", "black")
                .attr("stroke-width", '1px')
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

function addAxes(yScale, xScale){
   
    const xAxis = d3.axisBottom().scale(xScale).tickSize(400).ticks(7)
    const yAxis = d3.axisRight().scale(yScale).tickSize(400).ticks(5)

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


}