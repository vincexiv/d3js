d3.csv("parents.csv").then(data => handleParents(data))
d3.json("tweets.json").then(data => handleTweets(data))

function handleParents(data){
    const stratify = d3.stratify()
        .parentId(d => d.child)
        .id(d => d.parent)

    const strata = stratify(data)
}

function handleTweets(data){
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
  