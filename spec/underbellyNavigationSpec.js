const fs = require("fs")
const os = require("os")
const path = require("path")
const underbelly = require("../src/underbellyNavigation.js")
const data = require("../src/underbelly.json")

const lootRooms = ["aqueduct", "transfer", "engine room", "armory", "pipeline",
    "drain", "conduit", "irrigation", "ventilator"]
const encounters = ["gauntlet", "royal pools", "pleasure gardens", "throne room"]

// shortestPath returns an array with a weight property, so copy it to compare rooms.
function route(from, to) {
    return [...underbelly.shortestPath(from, to)]
}

function reachableFrom(room) {
    return underbelly.depthFirstSearch([room])
}

describe("Underbelly", function() {
    it("loads through the package entry point", function() {
        const pkg = require("../src/package.json")
        expect(require(path.join("../src", pkg.main))).toBe(underbelly)
    })

    it("keeps the graph-data-structure methods", function() {
        for (const method of ["addNode", "addEdge", "nodes", "adjacent", "shortestPath",
            "depthFirstSearch", "serialize", "deserialize", "exists", "JSON", "export"]) {
            expect(typeof underbelly[method]).withContext(method).toBe("function")
        }
    })

    it("contains Embarkment, every loot room and every encounter", function() {
        for (const room of ["embarkment", ...lootRooms, ...encounters]) {
            expect(underbelly.exists(room)).withContext(room).toBeTrue()
        }
        expect(data.lootRooms.slice().sort()).toEqual(lootRooms.slice().sort())
        expect(data.encounters.slice().sort()).toEqual(encounters.slice().sort())
    })

    it("does not know rooms that are not there", function() {
        expect(underbelly.exists("castellum")).toBeFalse()
    })

    it("has no misspelt or dead end pipeline rooms", function() {
        const nodes = underbelly.nodes()
        expect(nodes).not.toContain("pipleline")
        expect(nodes).not.toContain("pipe crawlspace")
        expect(nodes).not.toContain("pipe")
        expect(underbelly.adjacent("pipeline")).toContain("pipeline crawlspace")
        expect(underbelly.adjacent("pipeline crawlspace")).toContain("pipeline")
    })

    it("has no loose rooms", function() {
        for (const room of underbelly.nodes()) {
            expect(underbelly.exists(room)).withContext(room).toBeTrue()
        }
    })

    it("can reach every room from Embarkment", function() {
        const reached = reachableFrom("embarkment")
        for (const room of underbelly.nodes()) {
            expect(reached).withContext(room).toContain(room)
        }
    })

    it("can reach Embarkment and every encounter from every room", function() {
        for (const room of underbelly.nodes()) {
            // There is no way back out of the Throne Room.
            if (room === "throne room") continue
            const reached = reachableFrom(room)
            for (const target of ["embarkment", ...encounters]) {
                expect(reached).withContext(room + " to " + target).toContain(target)
            }
        }
    })

    it("only lets you leave the Throne Room by not going in", function() {
        expect(underbelly.adjacent("throne room")).toEqual([])
        expect(() => underbelly.shortestPath("throne room", "embarkment")).toThrowError("No path found")
    })

    it("uses the right weights for exits and encounters", function() {
        for (const [from, to, weight] of data.edges) {
            const w = weight === undefined ? 1 : weight
            expect([0, 1, 20, 100]).withContext(from + " to " + to).toContain(w)
            if (to === "embarkment") expect(w).withContext(from).toBe(20)
            if (encounters.includes(to)) expect(w).withContext(from + " to " + to).toBe(100)
            if (encounters.includes(from)) expect(w).withContext(from + " to " + to).toBe(1)
        }
    })

    it("has no duplicate edges", function() {
        const seen = new Set()
        for (const [from, to] of data.edges) {
            const key = from + "|" + to
            expect(seen.has(key)).withContext(key).toBeFalse()
            seen.add(key)
        }
    })

    describe("shortestPath", function() {
        it("stays put when going from Embarkment to Embarkment", function() {
            expect(route("embarkment", "embarkment")).toEqual(["embarkment"])
            expect(underbelly.shortestPath("embarkment", "embarkment").weight).toBe(0)
        })

        it("finds the Engine Room from Embarkment", function() {
            expect(route("embarkment", "engine room")).toEqual(
                ["embarkment", "water tube", "fan lift", "glowing hallways", "engine room"])
        })

        it("goes from Pipeline down to Drain through the crawlspace", function() {
            expect(route("pipeline", "drain")).toEqual(
                ["pipeline", "pipeline crawlspace", "drain ramps", "drain shaft", "drain"])
        })

        it("finds the Armory through the Transfer", function() {
            expect(route("embarkment", "armory")).toEqual(
                ["embarkment", "water tube", "fan lift", "transfer ramp", "transfer", "ore shaft", "armory"])
        })

        it("goes from Royal Pools to the Aqueduct by the corkscrew", function() {
            expect(route("royal pools", "aqueduct")).toEqual(
                ["royal pools", "royal pool ramp", "corkscrew", "aqueduct"])
        })

        it("reaches the Throne Room through the throne hallway", function() {
            const throne = underbelly.shortestPath("embarkment", "throne room")
            expect(throne.slice(-3)).toEqual(["hallway pipes", "throne hallway", "throne room"])
            expect(throne.weight).toBe(110)
        })

        it("avoids walking through encounters on the way somewhere else", function() {
            const rooms = route("drain", "aqueduct")
            expect(rooms.slice(1, -1).filter(room => encounters.includes(room))).toEqual([])
        })
    })

    describe("JSON and export", function() {
        it("serialises to JSON with every room and edge", function() {
            const json = JSON.parse(underbelly.JSON())
            expect(json.nodes.length).toBe(underbelly.nodes().length)
            expect(json.links.length).toBe(data.edges.length)
            expect(json.links).toContain({ source: "water tube", target: "embarkment", weight: 20 })
        })

        it("writes the JSON to an existing file", function() {
            const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "underbelly-")), "graph.json")
            fs.writeFileSync(file, "")
            underbelly.export(file)
            expect(fs.readFileSync(file, "utf8")).toBe(underbelly.JSON())
        })

        it("refuses to export to a path that does not exist", function() {
            expect(() => underbelly.export("/no/such/folder/graph.json")).toThrowError("Not a valid path")
        })
    })
})
