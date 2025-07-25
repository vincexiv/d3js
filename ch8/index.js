d3.json("world.geojson").then(countries => {
    createMap(countries)
})

function createMap(countries){
    const projection = d3.geoMercator()
        .scale(80)
        .translate([250, 250])
    const geoPath = d3.geoPath().projection(projection)

    d3.select("svg")
        .append("g")
        .attr("id", "world")
        .selectAll("path.country")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", geoPath)
        .attr("id", d => d.id)
        .style("fill", "darkgrey")
}