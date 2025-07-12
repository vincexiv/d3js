function createSoccerViz(){
    d3.csv("/worldcup.csv").then(data => {
        addControls(data)
        overalTeamViz(data)
    })
}

function overalTeamViz(data){
    d3.select("svg")
        .append("g")
        .attr("id", "teamsG")
        .attr("transform", "translate(50,100)")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("id", "overallG")
        .attr("transform", (d, i) =>"translate(" + (i * 50) + ", 0)")

    const overalG = d3.selectAll("g#overallG")

    overalG.append("circle")
        .attr("r", 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr("r", 40)
        .transition()
        .duration(500)
        .attr("r", 20)

    overalG.selectAll("circle")
        .on("mouseover", function (e, d) { highlightRegion(e, d, this)})
        .on("mouseout", function (e, d) { dehighlightRegion(e, d)})
        .on("click", function (e, d) { highlightText(e, d, this) })

    overalG.append("text")
        .attr("y", 40)
        .text(d => d.team)
}

function dehighlightRegion(e, data){
    d3.selectAll("circle").classed("active", false).classed("inactive", false)
}

function highlightRegion(e, data, context){
    d3.selectAll("circle")
        .attr("class", d => data.region === d.region ? 'active' : 'inactive') 
}

function highlightText(e, data){
    d3.selectAll("text")
        .attr("class", d => data.team === d.team ? 'active' : 'inactive')
        .transition()
        .duration(500)  
        .attr("y", d => data.team === d.team ? -40 : 40)

    const text = d3.select("text.active").node()
    text.parentElement.parentElement.append(text.parentElement)
}

function addControls(data){
    const keys = Object.keys(data[0]).filter(key => key !== 'team' && key !== 'region')

    d3.select("#controls")
        .selectAll("button.teams")
        .data(keys)
        .enter()
        .append("button")
        .attr("class", "teams")
        .on("click", e => buttonClick(e, data))
        .html(d => d)
}

function buttonClick(e, data){
    const key = e.target.textContent

    const extent = d3.extent(data, d => parseFloat(d[key]))
    const radiusScaler = d3.scaleLinear().domain(extent).range([0, 20])

    const overalG = d3.selectAll("g#overallG")

    overalG.select("circle")
        .transition().duration(500)
        .attr("r", d => radiusScaler(d[key]))
}

createSoccerViz()