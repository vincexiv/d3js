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

function forceDirectedNetworkDiagram(){
    const roleScale = d3.scaleOrdinal()
        .domain(["contractor", "employee", "manager"])
        .range(["#75739F", "#41A368", "#FE9922"])

    Promise.all([nodeList, edgeList]).then(resolve => {
        const nodes = resolve[0]
        const edges = resolve[1]

        const nodeHash = nodes.reduce((hash, node) => {
            hash[node.id] = node
            return hash
        }, {})

        edges.forEach(edge => {
                edge.weight = parseInt(edge.weight)
                edge.source = nodeHash[edge.source]
                edge.target = nodeHash[edge.target]
            })

        nodes.forEach(d => {
                d.degreeCentrality = edges.filter(
                p => p.source === d || p.target === d).length
            })

        d3.select("svg")
            .append("g")
            .attr("class", "links")
            .selectAll("line.link")
            .data(edges, d => `${d.source.id}-${d.target.id}`)
            .enter()
            .append("line")
            .attr("class", "link")
            .style("stroke-width", d => d.weight)
            .style("opacity", "0.5")

        const simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-30))
            .force("center", d3.forceCenter().x(250).y(250))
            .force("link", d3.forceLink())
            .nodes(nodes)
            .on("tick", forceTick)

        simulation.force("link").links(edges)

        const nodeEnter = d3.select("svg")
            .append("g")
            .attr("class", "nodes")
            .selectAll("g.node")
            .data(nodes, d => d.id)
            .enter()
            .append("g")
            .attr("class", "node")

        nodeEnter.append("circle")
            .attr("r", 5)
            .style("fill", d => roleScale(d.role))
            .style("stroke", "none")

        nodeEnter.append("text")
            .text(d => d.id)
            .attr("text-anchor", "middle")
            .attr("y", 15)

        const marker = d3.select("svg").append('defs')
            .append('marker')
            .attr("id", "triangle")
            .attr("refX", 12)
            .attr("refY", 6)
            .attr("markerUnits", 'userSpaceOnUse')
            .attr("markerWidth", 12)
            .attr("markerHeight", 18)
            .attr("orient", 'auto')
            .append('path')
            .attr("d", 'M 0 0 12 6 0 12 3 6');
            d3.selectAll("line").attr("marker-end", "url(#triangle)");

        d3.selectAll("line").attr("marker-end", "url(#triangle)");

        d3.select("#controls").append("button")
            .on("click", () => sizeByDegree(simulation)).html("Degree Size")

        d3.select("#controls").append("button")
            .on("click", () => filterNetwork(simulation)).html("Filter network")

        d3.select("#controls").append("button")
            .on("click", () => manuallyPositionNodes(simulation)).html("Manually position nodes")

        const drag = d3.drag()
            .on("drag", (e, d) => dragging(e, d, simulation))

        d3.select("svg")
            .selectAll("g.node")
            .call(drag)
    })
}

function filterNetwork(simulation){
    const originalNodes = simulation.nodes()
    const originalEdges = simulation.force("link").links()

    const newNodes = originalNodes.filter(n => n.role === 'employee')
    const newEdges = originalEdges.filter(e =>  e.source.role === 'employee' && e.target.role === 'employee')

    d3.select("svg")
        .selectAll("line.link")
        .data(newEdges, d => `${d.source.id}-${d.target.id}`)
        .exit()
        .transition()
        .duration(4000)
        .style("opacity", 0)
        .remove()

    d3.select("svg")
        .selectAll("g.node")
        .data(newNodes, d => d.id)
        .exit()
        .transition()
        .duration(3000)
        .style("opacity", 0)
        .remove()

    simulation.stop()
    simulation.nodes(newNodes)
    simulation.force("link").links(newEdges)
    simulation.alpha(0.1)
    simulation.restart()
}

function manuallyPositionNodes(simulation){
    const originalEdges = simulation.force("link").links()
    const originalNodes = simulation.nodes()

    const yExtent = d3.extent(originalNodes, d => parseInt(d.salary))
    const xExtent = d3.extent(originalNodes, d => parseInt(d.degreeCentrality))

    const yScale = d3.scaleLinear().domain(yExtent).range([450, 50])
    const xScale = d3.scaleLinear().domain(xExtent).range([50, 400])

    simulation.stop()

    d3.select("svg")
        .selectAll("line.link")
        .style("opacity", 0)
        .attr("x1", d => xScale(parseInt(d.source.degreeCentrality)))
        .attr("y1", d => yScale(parseInt(d.source.salary)))
        .attr("x2", d => xScale(parseInt(d.target.degreeCentrality)))
        .attr("y2", d => yScale(parseInt(d.target.salary)))

    d3.select("svg")
        .selectAll("g.node")
        .attr("x", d => xScale(parseInt(d.degreeCentrality)))
        .attr("y", d => yScale(parseInt(d.salary)))

    d3.selectAll("g.node")
        .each(d => {
            d.x = xScale(d.degreeCentrality)
            d.y = yScale(d.salary)
            d.vy = 0
            d.vx = 0
        })

    const xAxis = d3.axisBottom().scale(xScale).ticks(7)
    const yAxis = d3.axisRight().scale(yScale)

    const xAxisG = d3.select("g#xAxisG")
    if(xAxisG.empty()){
        d3.select("svg")
            .append("g")
            .attr("id", "xAxisG")
            .attr("transform", "translate(0, 450)")
            .call(xAxis)
    }

    const yAxisG = d3.select("g#yAxisG")
    if(yAxisG.empty()){
        const axis = d3.select("svg")
            .append("g")
            .attr("id", "yAxisG")
            .attr("transform", "translate(400, 0)")

        axis.call(yAxis)
        axis.selectAll("text")
            .attr("transform", "translate(20, 0)")
    }

    simulation.restart()
}

function dragging(e, d, simulation){
    d.fx = e.x
    d.fy = e.y
    if (simulation.alpha() < 0.1) {
        simulation.alpha(0.1)
        simulation.restart()
    }
}

function sizeByDegree(simulation) {
    simulation.stop()
    simulation.force("charge", d3.forceManyBody().strength(d => -d.degreeCentrality * 20))
    simulation.restart()
    d3.selectAll("circle")
    .attr("r", d => d.degreeCentrality * 2)
}

function forceTick(){
    d3.selectAll("line.link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .style("stroke", "black")

    d3.selectAll("g.node")
        .attr("transform", d => `translate(${d.x},${d.y})`)
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

forceDirectedNetworkDiagram()