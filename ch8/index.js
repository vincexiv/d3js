function world(){
    d3.json("world.geojson").then(world => {
        const projection = d3.geoMercator()
            .scale(80)
            .translate([250, 250])
        createMap(world, projection)
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
        const projection = d3.geoMollweide()
            .scale(160)
            .translate([250, 250])

        createMap(world, projection)
        markCities(cities, projection)
    })
}

function coloredWorld(){
    const PromiseWrapper = (xhr, d) => {
        return new Promise(resolve => {
            xhr(d).then(d => resolve(d))
        })
    }
    const a = PromiseWrapper(d3.json, "world.geojson")
    const b = PromiseWrapper(d3.csv, "cities.csv")
    const c = PromiseWrapper(d3.json, "colorbrewer.json")
    const allData = Promise.all([a, b, c])
    
    allData.then(resolve => {
        const world = resolve[0]
        const cities = resolve[1]
        const colors = resolve[2]["Reds"][7]
        const projection = d3.geoMollweide()
            .scale(160)
            .translate([250, 250])

        createColoredMap(world, projection, colors)
        markCities(cities, projection)
    })
}

function createMap(world, projection){
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

function markCities(cities, projection){
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

function createColoredMap(world, projection, colors){
    const geoPath = d3.geoPath().projection(projection)

    const colorExtent = d3.extent(world.features, d => geoPath.area(d))
    const colorScale = d3.scaleQuantize().domain(colorExtent).range(colors)

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
        .style("fill", d => colorScale(geoPath.area(d)))
}



coloredWorld()