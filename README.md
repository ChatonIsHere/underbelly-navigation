# Underbelly Navigation

A map of the Underbelly beneath the Leviathan raid in Destiny 2, as a graph you can find routes through.

Try it here: https://chatonishere.github.io/underbelly-navigation/

## The data

The rooms and the one-way links between them are in `src/underbelly.json`. Links weigh 1 unless they say otherwise: 20 for going back out to Embarkment, 100 for going into an encounter and 0 for links that take no time. The page and the Node module both read this file.

## Node

```js
const underbelly = require("./src/underbellyNavigation.js")
underbelly.shortestPath("embarkment", "armory")
```

It is a [graph-data-structure](https://www.npmjs.com/package/graph-data-structure) graph with `exists`, `JSON` and `export` added.

## Tests

```sh
cd src
yarn install
yarn test
```
