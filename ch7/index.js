const nodeList = new Promise((resolve, reject) => {
    d3.csv("nodelist.csv").then(d => resolve(d)).catch(e => reject(e))
})
const edgeList = new Promise((resolve, reject) => {
    d3.csv("edgelist.csv").then(d => resolve(d)).catch(e => reject(e))
})

const data = Promise.all([nodeList, edgeList]).then(resolve => {
    const nodes = resolve[0]
    const edges = resolve[1]

    const edgeHash = {}
    edges.forEach((edge) => {
        const id = `${edge.source}-${edge.target}`
        edgeHash[id] = edge
    })

    const matrix = []

    nodes.forEach((source, a) => {
        nodes.forEach((target, b) => {
            const grid = {
                id: `${source.id}-${target.id}`,
                y: a,
                x: b,
                weight: 0
            }

            if(edgeHash[grid.id]){
                grid.weight = edgeHash[grid.id].weight
            }

            matrix.push(grid)
        })
    })

    createAdjacencyMatrix(matrix, nodes)
})

function createAdjacencyMatrix(matrix, nodes){
    d3.select("svg")
        .append("g")
        .attr("id", "adjacencyMatrixG")
        .selectAll("rect.cell")
        .data(matrix)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("width", "25")
        .attr("height", "25")
        .attr("x", d => d.x * 25)
        .attr("y", d => d.y * 25)
        .style("fill-opacity", d => d.weight * .2)
        .style("fill", "#FE9922")
        .attr("stroke", "darkgrey")
        .attr("stroke-width", "1")
        .attr("transform", "translate(50, 50)")

    d3.select("svg")
        .append("g")
        .attr("id", "labelSourceG")
        .selectAll("text.label")
        .data(nodes)
        .enter()
        .append("text")
        .text(d => d.id)
        .attr("class", "label")
        .attr("transform", "translate(50, 45)")
        .style("text-anchor", "middle")
        .attr("x", (d,i) => i * 25 + 12.5)

    d3.select("svg")
        .append("g")
        .attr("id", "labelTargetG")
        .selectAll("text.label")
        .data(nodes)
        .enter()
        .append("text")
        .text(d => d.id)
        .attr("class", "label")
        .attr("transform", "translate(40, 50)")
        .style("text-anchor", "end")
        .attr("y", (d,i) => i * 25 + 12.5)
}