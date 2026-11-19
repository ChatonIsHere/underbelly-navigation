const Graph = require("graph-data-structure")
const fs = require('fs');
const data = require("./underbelly.json")

// Rooms and edges live in underbelly.json so the web page can use them too.
// Edges only go one way. Weights: 1 by default, 20 for exits to Embarkment,
// 100 for entering an encounter, 0 for links that take no time.
let ub = Graph()
    .addNode(data.embarkment)

data.lootRooms.forEach(room => ub.addNode(room))
data.encounters.forEach(room => ub.addNode(room))
data.edges.forEach(([from, to, weight]) => ub.addEdge(from, to, weight))

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
