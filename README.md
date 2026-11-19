# Underbelly Navigation

A map of the Underbelly beneath the Leviathan raid in Destiny 2, as a graph you can find routes through.

Try it here: https://chatonishere.github.io/underbelly-navigation/

## The data

The rooms and the one-way links between them are in `src/underbelly.json`, weighted in seconds. A link with a third value has a measured time (0 for links that take no time). The rest use the average of the measured links. Going into an encounter adds `encounterPenalty`, so routes only go through one when there's no other way.

The measured times come from the videos listed under `sources`. Add a link's time there and the average updates itself. The page and the Node module both read this file.

## Node

```js
const underbelly = require("./src/underbellyNavigation.js")
const route = underbelly.shortestPath("embarkment", "armory")
underbelly.seconds(route) // walking time, without the encounter penalty
```

It is a [graph-data-structure](https://www.npmjs.com/package/graph-data-structure) graph with `exists`, `seconds`, `defaultSeconds`, `JSON` and `export` added.

## Tests

```sh
cd src
yarn install
yarn test
```
