function world(){
    d3.json("world.geojson").then(world => {
        createMap(world)
    })
}

function cities(){
    const PromiseWrapper = (xhr, d) => {
        return new Promise(resolve => {
            xhr(d).then(d => resolve(d))
        })
    }
    const a = PromiseWrapper(d3.json, "world.geojson")
    const b = PromiseWrapper(d3.csv, "cities.csv")
    const allData = Promise.all([a, b])
    
    allData.then(resolve => {
        const world = resolve[0]
        const cities = resolve[1]
    
        createMap(world)
        markCities(cities)
    })
}

function createMap(world){
    const projection = d3.geoMercator()
        .scale(80)
        .translate([250, 250])
    const geoPath = d3.geoPath().projection(projection)

    d3.select("svg")
        .append("g")
        .attr("id", "world")
        .selectAll("path.country")
        .data(world.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", geoPath)
        .attr("id", d => d.id)
        .style("fill", "darkgrey")
}

function markCities(cities){
    const projection = d3.geoMercator()
        .scale(80)
        .translate([250, 250])

    d3.select("svg")
        .append("g")
        .attr("id", "cities")
        .selectAll("circle")
        .data(cities)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", d => projection([d.x, d.y])[0])
        .attr("cy", d => projection([d.x, d.y])[1])
        .style("fill", "yellow")
        .style("stroke", "black")
        .style("opacity", 0.8)
}



cities()