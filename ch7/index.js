const nodeList = new Promise((resolve, reject) => {
    d3.csv("nodelist.csv").then(d => resolve(d)).catch(e => reject(e))
})
const edgeList = new Promise((resolve, reject) => {
    d3.csv("edgelist.csv").then(d => resolve(d)).catch(e => reject(e))
})

function adjacencyMatrix(){
    Promise.all([nodeList, edgeList]).then(resolve => {
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
}

function arcDiagram(){
    Promise.all([nodeList, edgeList]).then(resolve => {
        const nodes = resolve[0]
        const edges = resolve[1]
            
        const edgeHash = {}
        edges.forEach(edge => {
            edgeHash[`${edge.source}-${edge.target}`] = edge
        })
        
        const connections = []
        nodes.forEach((source, a) => {
            nodes.forEach((target, b) => {    
                if(edgeHash[`${source.id}-${target.id}`] && target.id !== source.id){
                    const item = {
                        source: source,
                        target: target,
                        source_pos: a,
                        target_pos: b,
                        weight: edgeHash[`${source.id}-${target.id}`].weight
                    }
                    connections.push(item)
                }
            })
        })

        createArcDiagram(connections, nodes)
    })  
}

function forceDirectedLayout(){
    const roleScale = d3.scaleOrdinal().range(["#75739F", "#41A368", "#FE9922"])
    const sampleData = d3.range(300).map(() =>({r: 2, value: 250 + d3.randomNormal()() * 50}))

    d3.select("svg")
        .append("g")
        .attr("id", "circlesG")
        .selectAll("circle.node")
        .data(sampleData)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", d => d.r)
        .style("fill", (d, i) => roleScale(i))
        .style("stroke", "none")

    d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(1))
        .force("center", d3.forceCenter().x(250).y(250))
        .force("collision", d3.forceCollide(d => d.r))
        .force("x", d3.forceX(100))
        .force("y", d3.forceY(d => d.value).strength(1))
        .nodes(sampleData)
        .on("tick", updateNetwork)
}

function createArcDiagram(connections, nodes){
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50, 250)")
        .attr("id", "nodes")
        .selectAll("circle.node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "nodeG")
        .attr("transform", (d, i) => `translate(${i * 25}, 0)`)
        .append("circle")
        .attr("class", "node")
        .attr("r", 5)

    d3.select("svg")
        .selectAll("g.nodeG")
        .append("text")
        .text(d => d.id)
        .attr("transform", "translate(0, 15)")

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50, 250)")
        .selectAll("path.edge")
        .data(connections)
        .enter()
        .append("path")
        .attr("d", arc)
        .style("stroke-width", d => d.weight * 2)
        .style("fill", "none")
        .style("stroke", "black")
        .style("opacity", 0.25)
}

function updateNetwork(d, i){
    d3.select("svg")
        .selectAll("circle.node")
        .attr("cy", d => d.x)
        .attr("cx", d => d.y)
        .style("opacity", d => (d.value - Math.abs(d.value - d.y))/d.value)
}

function arc(d, i){
    const draw = d3.line().curve(d3.curveBasis)
    const middleX = (d.target_pos + d.source_pos) / 2
    const middleY = (d.target_pos - d.source_pos) * 25
    const path = draw([[d.source_pos * 25, 0], [middleX * 25, middleY], [d.target_pos * 25, 0]])
    return path
}


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

forceDirectedLayout()