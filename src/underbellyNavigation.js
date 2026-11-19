const Graph = require("graph-data-structure")
const fs = require('fs');
const data = require("./underbelly.json")

// Rooms and edges live in underbelly.json so the web page can use them too.
// Edges only go one way and are weighted in seconds. A third value is a measured time (0 for
// links that take no time). Edges without one use the average of the measured ones.
// Going into an encounter also costs encounterPenalty, so routes only go through one when
// there's no other way. seconds() gives the walking time without it.
const timed = data.edges.filter(edge => edge[2] > 0)
const defaultSeconds = timed.reduce((total, edge) => total + edge[2], 0) / timed.length
const walk = {}

let ub = Graph()
    .addNode(data.embarkment)

data.lootRooms.forEach(room => ub.addNode(room))
data.encounters.forEach(room => ub.addNode(room))
data.edges.forEach(([from, to, seconds = defaultSeconds]) => {
    walk[from + ">" + to] = seconds
    ub.addEdge(from, to, seconds + (data.encounters.includes(to) ? data.encounterPenalty : 0))
})

ub.defaultSeconds = defaultSeconds

ub.seconds = function(route) {
    let total = 0
    for (let i = 1; i < route.length; i++) total += walk[route[i - 1] + ">" + route[i]]
    return total
}

ub.exists = function(node) {
    if (this.indegree(node) > 0 || this.outdegree(node) > 0) return true
    else return false
}

ub.JSON = function() {
    return JSON.stringify(ub.serialize(), null, 2)
}

ub.export = function(path) {
    if (fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify(ub.serialize(), null, 2))
    else throw new Error("Not a valid path")
}

module.exports = ub;
