const underbelly = require("../src/underbellyNavigation.js")

describe("Underbelly", function() {
    it("should exist", function() {
        expect(underbelly)
    })

    it("should contain a Throne Room", function() {
        expect(underbelly.exists("throne room"))
    })

    it("should contain a no-step path to Embarkment", function() {
        expect(underbelly.shortestPath("embarkment", "embarkment"))
    })
})
