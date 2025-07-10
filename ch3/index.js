const scatterData = [{friends: 5, salary: 22000},
    {friends: 3, salary: 18000}, {friends: 10, salary: 88000},
    {friends: 0, salary: 180000}, {friends: 27, salary: 56000},
    {friends: 8, salary: 74000}];


function createScatter(data){
    const yExtent = d3.extent(scatterData, d => d.salary)
    const xExtent = d3.extent(scatterData, d => d.friends)

    const yScale = d3.scaleLinear().domain([0, yExtent[1]]).range([50, 450])
    const xScale = d3.scaleLinear().domain([0, xExtent[1]]).range([50, 450])

    const yAxis = d3.axisRight().scale(yScale)
    .tickSize(400).ticks(10)
    const xAxis = d3.axisBottom().scale(xScale)
    .tickSize(400).ticks(6)

    const chart = d3.select('svg')

    chart.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.friends))
        .attr("cy", d => yScale(d.salary))
        .attr("r", 5)
        .style("vector-effect", "non-scaling-stroke")

    chart.append("g")
        .attr('id', 'yAxisG')
        .attr("transform", "translate(50, 0)")
        .call(yAxis)

    chart.append("g")
        .attr("id", "xAxisG")
        .attr("transform", "translate(0, 50)")
        .style("font-size", "1px")
        .call(xAxis)
}

createScatter(scatterData)