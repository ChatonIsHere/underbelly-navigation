const Graph = require("graph-data-structure")
const fs = require('fs');

// Underbelly Graph Setup
let ub = Graph()
    .addNode("embarkment")
// End Underbelly Graph Setup

// Add Loot Room Nodes
ub  .addNode("aqueduct")
    .addNode("transfer")
    .addNode("engine room")
    .addNode("armory")
    .addNode("pipleline")
    .addNode("drain")
    .addNode("conduit")
    .addNode("irrigation")
    .addNode("ventilator")
// End Add Loot Room Nodes

// Add Encounter Nodes
ub  .addNode("gauntlet")
    .addNode("royal pools")
    .addNode("pleasure gardens")
    .addNode("throne room")
// End Add Encounter Nodes

// Add Connections
// Note: Edges only go one way
ub  .addEdge("embarkment", "water tube")
    .addEdge("water tube", "embarkment", 20) // Exit

    .addEdge("water tube", "fan lift")
    .addEdge("fan lift", "water tube")

    .addEdge("fan lift", "glowing hallways")
    .addEdge("fan lift", "transfer ramp")
    .addEdge("glowing hallways", "fan lift")
    .addEdge("transfer ramp", "fan lift")

    .addEdge("glowing hallways", "engine room")
    .addEdge("engine room", "glowing hallways")

    .addEdge("transfer ramp", "transfer")
    .addEdge("transfer", "transfer ramp")

    .addEdge("transfer", "transfer pipes")
    .addEdge("transfer pipes", "transfer")

    .addEdge("transfer pipes", "transfer junction")
    .addEdge("transfer junction", "transfer pipes")
    
    .addEdge("transfer junction", "control room ramp")
    .addEdge("transfer junction", "illusary wall")
    .addEdge("control room ramp", "transfer junction")
    .addEdge("illusary wall", "transfer junction")
    .addEdge("illusary wall", "embarkment", 20) // Exit

    .addEdge("control room ramp", "control room")
    .addEdge("control room", "control room ramp")

    .addEdge("control room", "grinder room")
    .addEdge("grinder room", "control room")
    
    .addEdge("grinder room", "aqueduct")
    .addEdge("aqueduct", "grinder room")

    .addEdge("aqueduct", "corkscrew")
    .addEdge("aqueduct", "aqueduct ramp")
    .addEdge("corkscrew", "aqueduct")
    .addEdge("aqueduct ramp", "aqueduct")
    .addEdge("aqueduct ramp", "embarkment", 20) // Exit

    .addEdge("corkscrew", "royal pool ramp")
    .addEdge("royal pool ramp", "corkscrew")

    .addEdge("royal pool ramp", "royal pools", 100)
    .addEdge("royal pools", "royal pool ramp", 1)
    
    .addEdge("grinder room", "grinder shaft")
    .addEdge("grinder shaft", "grinder room")

    .addEdge("grinder shaft", "chain room")
    .addEdge("chain room", "grinder shaft")

    .addEdge("chain room", "ventilator shaft")
    .addEdge("ventilator shaft", "chain room")

    .addEdge("ventilator shaft", "ventilator")
    .addEdge("ventilator shaft", "engine room")
    .addEdge("ventilator", "ventilator shaft")
    .addEdge("engine room", "ventilator shaft")

    .addEdge("engine room", "burner hall")
    .addEdge("burner hall", "engine room")

    .addEdge("burner hall", "trash room")
    .addEdge("trash room", "burner hall")

    .addEdge("trash room", "pipe shaft", 0)
    .addEdge("pipe shaft", "trash room", 0)

    .addEdge("pipe shaft", "stone ramps", 0)
    .addEdge("stone ramps", "pipe shaft", 0)

    .addEdge("stone ramps", "pleasure gardens", 100)
    .addEdge("pleasure gardens", "stone ramps", 1)

    .addEdge("transfer", "ore shaft")
    .addEdge("ore shaft", "transfer")

    .addEdge("armory", "ore shaft")
    .addEdge("ore shaft", "armory")

    .addEdge("armory", "pipe maze")
    .addEdge("pipe maze", "armory")

    .addEdge("pipe maze", "gauntlet ramp")
    .addEdge("gauntlet ramp", "pipe maze")

    .addEdge("gauntlet ramp", "gauntlet", 100)
    .addEdge("gauntlet", "gauntlet ramp", 1)

    .addEdge("ventilator", "ventilator lift")
    .addEdge("ventilator lift", "ventilator")

    .addEdge("ventilator lift", "tube hall")
    .addEdge("tube hall", "ventilator lift")

    .addEdge("tube hall", "hallway pipes")
    .addEdge("hallway pipes", "tube hall")
    
    .addEdge("hallway pipes", "throne hallway")
    .addEdge("throne hallway", "hallway pipes")

    .addEdge("throne hallway", "throne room", 100)

    .addEdge("hallway pipes", "zappy hall")
    .addEdge("zappy hall", "hallway pipes")

    .addEdge("zappy hall", "conduit ramps")
    .addEdge("conduit ramps", "zappy hall")

    .addEdge("conduit ramps", "conduit lift")
    .addEdge("conduit lift", "conduit ramps")

    .addEdge("conduit lift", "conduit")
    .addEdge("conduit", "conduit lift")

    .addEdge("conduit", "conduit backroom")
    .addEdge("conduit backroom", "conduit")

    .addEdge("conduit backroom", "irrigation")
    .addEdge("irrigation", "conduit backroom")

    .addEdge("irrigation", "pleasure gardens", 100)
    .addEdge("pleasure gardens", "irrigation", 1)

    .addEdge("irrigation", "messy hallways")
    .addEdge("messy hallways", "irrigation")

    .addEdge("messy hallways", "hanging gardens")
    .addEdge("hanging gardens", "messy hallways")

    .addEdge("hanging gardens", "garden ramps")
    .addEdge("garden ramps", "hanging gardens")

    .addEdge("garden ramps", "gauntlet", 100)
    .addEdge("gauntlet", "garden ramps", 1)

    .addEdge("ventilator lift", "doorway", 0)
    .addEdge("doorway", "ventilator lift", 0)

    .addEdge("doorway", "red fall tube")
    .addEdge("doorway", "pipeline ramps")
    .addEdge("pipeline ramps", "doorway")

    .addEdge("red fall tube", "pipeline")
    .addEdge("pipeline ramps", "pipeline")
    .addEdge("pipeline", "pipeline ramps")

    .addEdge("pipeline", "pipe crawlspace")
    .addEdge("pipeline crawlspace", "pipe")

    .addEdge("pipeline crawlspace", "drain ramps")
    .addEdge("drain ramps", "pipeline crawlspace")

    .addEdge("drain ramps", "drain shaft")
    .addEdge("drain shaft", "drain ramps")

    .addEdge("drain shaft", "drain")
    .addEdge("drain", "drain shaft")

    .addEdge("drain", "drain tight hallways")
    .addEdge("drain tight hallways", "drain")

    .addEdge("drain tight hallways", "royal pools", 100)
    .addEdge("royal pools", "drain tight hallways", 1)

    .addEdge("drain", "drainpipes")
    .addEdge("drainpipes", "drain")

    .addEdge("drainpipes", "pleasure gardens", 100)
    .addEdge("pleasure gardens", "drainpipes", 1)
// End Add Connections

// console.log(ub.serialize())
// console.log(ub.shortestPath("pipeline", "armory"))
fs.writeFileSync('../underbelly.json', JSON.stringify(ub.serialize(), null, 2))

ub.exists = function(node) {
    if (this.indegree(node) > 0 || this.outdegree(node) > 0) return true
    else return false
}