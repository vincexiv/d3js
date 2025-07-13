// d3.csv("parents.csv").then(data => handleParents(data))
// d3.json("tweets.json").then(data => packedCircles(data))
d3.json("tweets.json").then(data => dendogram(data))

function handleParents(data){
    const stratify = d3.stratify()
        .parentId(d => d.child)
        .id(d => d.parent)

    const strata = stratify(data)
}

function dendogram(data){
    const depthScale = d3.scaleOrdinal().range(["#5EAFC6", "#FE9922", "#93c464", "#75739F"])

    const groups = d3.group(data.tweets, d => d.user)
    const hierarchy = d3.hierarchy(groups, d => d[1])
        .sum(d => {
            const favorites = d.favorites?.length || 0
            const retweets = d.retweets?.length || 0
            return favorites + retweets + 1
        })

    const tree = d3.tree()
        .size([400, 400])

    const treeChart = tree(hierarchy)

    d3.select("svg")
        .selectAll("line.link")
        .data(treeChart.descendants().filter(d => d.parent))
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("y1", d => d.x)    
        .attr("x1", d => d.y)
        .attr("x2", d => d.parent.y)
        .attr("y2", d => d.parent.x)
        .attr("transform", "translate(50, 50)")
        .style("stroke", "black")

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50, 50)")
        .selectAll("g.node")
        .data(treeChart.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y}, ${d.x})`)

    d3.selectAll("g.node")
        .append("circle")
        .attr("r", 10)
        .style("fill", d => depthScale(d.depth))   
        
    d3.selectAll("g.node")
        .append("text")
        .style("text-anchor", "middle")
        .style("fill", "#4f442b")
        .text(d => {
            if(d.depth == 0){
                return 'All tweets'
            } else if (d.depth == 1){
                return d.data[0]
            } else if (d.depth == 2){
                return d.data.content
            }
        })

}

function packedCircles(data){
    const groups = d3.group(data.tweets, d => d.user)

    const depthScale = d3.scaleOrdinal().range(["#5EAFC6", "#FE9922", "#93c464", "#75739F"])
    const hierarchy = d3.hierarchy(groups, d => d[1])
        .sum(d => {
            const favorites = d.favorites?.length || 0
            const retweets = d.retweets?.length || 0
            return favorites + retweets + 1
        })

    const pack = d3.pack()
        .size([400, 400])
        .padding(5)

    d3.select("svg")
        .append("g")
        .attr("id", "root")
        .attr("transform", "translate(50, 50)")
        .selectAll("circle")
        .data(pack(hierarchy).descendants())
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .style("fill", (d, i) => depthScale(d.depth))
}
  