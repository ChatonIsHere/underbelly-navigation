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

    it("weighs edges in seconds, defaulting to the average measured time", function() {
        const measured = data.edges.filter(edge => edge[2] > 0).map(edge => edge[2])
        const average = measured.reduce((a, b) => a + b, 0) / measured.length
        expect(underbelly.defaultSeconds).toBeCloseTo(average, 6)
        for (const [from, to, seconds] of data.edges) {
            if (seconds === undefined) continue
            expect(seconds).withContext(from + " to " + to).toBeGreaterThanOrEqual(0)
            expect(seconds).withContext(from + " to " + to).toBeLessThan(120)
        }
    })

    it("adds the encounter penalty only when going into an encounter", function() {
        const json = JSON.parse(underbelly.JSON())
        for (const link of json.links) {
            const edge = data.edges.find(e => e[0] === link.source && e[1] === link.target)
            const seconds = edge[2] === undefined ? underbelly.defaultSeconds : edge[2]
            const penalty = encounters.includes(link.target) ? data.encounterPenalty : 0
            expect(link.weight).withContext(link.source + " to " + link.target).toBeCloseTo(seconds + penalty, 6)
        }
    })

    it("matches the measured video segments", function() {
        for (const source of data.sources) {
            for (const segment of source.segments) {
                const [from, to] = segment.rooms
                expect(underbelly.seconds(route(from, to))).withContext(from + " to " + to).toBe(segment.seconds)
            }
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
            expect(throne.weight - underbelly.seconds(throne)).toBeCloseTo(data.encounterPenalty, 6)
        })

        it("takes the measured 170 seconds from Royal Pools to the Gauntlet", function() {
            expect(underbelly.seconds(route("royal pools", "gauntlet"))).toBe(170)
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
            expect(json.links).toContain({ source: "water tube", target: "embarkment", weight: underbelly.defaultSeconds })
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
