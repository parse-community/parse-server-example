[3.3.0](https://github.com/ljharb/json-file-plus/releases/tag/v3.3.0) / 2016-03-22
==================
  * [New] Add `JSONData#remove` (#16)
  * [Dev Deps] update `tape`, `object-keys`, `jscs`, `eslint`, `@ljharb/eslint-config`, `nsp`
  * Rename repo to `json-file-plus` (#15)
  * [Tests] up to `node` `v5.9`, `v4.4`
  * [Tests] fix npm upgrades on older nodes
  * [Tests] Use pretest/posttest for linting/security

[3.2.0](https://github.com/ljharb/json-file-plus/releases/tag/v3.2.0) / 2015-10-17
==================
  * [New] Add `readJSON.sync`, and `JSONFile#saveSync`, for command line scripts

[3.1.0](https://github.com/ljharb/json-file-plus/releases/tag/v3.1.0) / 2015-10-17
==================
  * [New] Create `JSONData` and expose it, to separate "file" behavior from "json" behavior
  * [Deps] update `is`, `promiseback`
  * [Dev Deps] update `tape`, `jscs`, `eslint`, `@ljharb/eslint-config`, `nsp`, `object-keys`
  * [Tests] up to `io.js` `v3.3`, `node` `v4.2`
  * [Tests] Use `evalmd` to verify the README

[3.0.1](https://github.com/ljharb/json-file-plus/releases/tag/v3.0.1) / 2015-08-18
==================
  * [Docs] Switch from vb.teelaun.ch to versionbadg.es for the npm version badge SVG
  * [Deps] update `node.extend`
  * [Dev Deps] update `object-keys`, `covert`, `tape`, jscs`
  * [Tests] up to `io.js` `v3.0`
  * [Tests] add `npm run eslint` and `@ljharb/eslint-config`
  * [Tests] add `npm run security`

[3.0.0](https://github.com/ljharb/json-file-plus/releases/tag/v3.0.0) / 2015-05-03
==================
  * Make sure to reject the promise if writeFile errors (#7)
  * All grade A-supported `node`/`iojs` versions now ship with an `npm` that understands `^`
  * Speed up `travis-ci` builds; test on latest `node` and `io.js` versions
  * Update `is`, `jscs`, `tape`

[2.0.1](https://github.com/ljharb/json-file-plus/releases/tag/v2.0.1) / 2015-02-06
==================
  * Update `is`, `tape`, `jscs`, `node.extend`, `object-keys`, `promiseback`
  * Run `travis-ci` tests on `iojs`

[2.0.0](https://github.com/ljharb/json-file-plus/releases/tag/v2.0.0) / 2014-09-25
==================
  * Update `jscs`, `tape`, `foreach`
  * Use `promiseback` to both take a callback and return a Promise

[1.0.7](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.7) / 2014-09-03
==================
  * Update `jscs`, `is`, `object-keys`

[1.0.6](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.6) / 2014-09-01
==================
  * Update `jscs`, `node.extend`
  * Add badges to README

[1.0.5](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.5) / 2014-08-27
==================
  * Update `object-keys`

[1.0.4](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.4) / 2014-08-25
==================
  * Update `is`

[1.0.3](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.3) / 2014-08-25
==================
  * Update `is`
  * clean up README

[1.0.2](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.2) / 2014-08-13
==================
  * Oops, `jscs` should be a devDependency

[1.0.1](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.1) / 2014-08-11
==================
  * Update `is`, `covert`, `node.extend`

[1.0.0](https://github.com/ljharb/json-file-plus/releases/tag/v1.0.0) / 2014-08-07
==================
  * Update `tape`, `object-keys`, `is`, `node.extend`
  * Add `npm run coverage` and `npm run lint`
  * Updating tests

[0.2.3](https://github.com/ljharb/json-file-plus/releases/tag/v0.2.3) / 2013-12-07
==================
  * ensure raw file contents are compared as a string - in node 0.6 and 0.8, it’s a Buffer.
  * Updating `tape`
  * Adding some badges to `README`

[0.2.2](https://github.com/ljharb/json-file-plus/releases/tag/v0.2.2) / 2013-10-14
==================
  * Adding a `CHANGELOG`
  * Updating `tape`
  * Pass the utf8 encoding option to avoid the extra step of converting a buffer to a string

[0.2.1](https://github.com/ljharb/json-file-plus/releases/tag/v0.2.1) / 2013-09-17
==================
  * Correcting `README`
  * Adding a `LICENSE` file
  * Updating `tape`

[0.2.0](https://github.com/ljharb/json-file-plus/releases/tag/v0.2.0) / 2013-08-20
==================
  * Updating `README`
  * Removing the filename requirement to `save`
  * Pass in the filename when constructing an object

[0.1.1](https://github.com/ljharb/json-file-plus/releases/tag/v0.1.1) / 2013-08-20
==================
  * Updating `node.extend`, `foreach`, `object-keys`

[0.1.0](https://github.com/ljharb/json-file-plus/releases/tag/v0.1.0) / 2013-08-14
==================
  * Updating dependencies
  * Denesting tests so they pass
  * Fixing incorrect variable references
  * Removing incorrect test end calls
  * Fixing the filename to not rely on process.cwd() being automatically added. Fixes [#4](https://github.com/ljharb/json-file-plus/issues/4)
  * Merge pull request [#1](https://github.com/ljharb/json-file-plus/issues/1) from Raynos/patch-1
    setImmediate is not needed
  * Fixing tests - however, nested tests don't work in `tape` 1.0.2
  * Using tape again!
  * Merge pull request [#2](https://github.com/ljharb/json-file-plus/issues/2) from Raynos/patch-2
    Read the file I give you. Dont assume cwd()
  * setImmediate is not needed

[0.0.8](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.8) / 2013-04-24
==================
  * Using `tap` instead of `tape`
  * Updating the error tests

[0.0.7](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.7) / 2013-04-17
==================
  * Updating `node.extend` and `is`

[0.0.6](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.6) / 2013-04-17
==================
  * Updating `is`

[0.0.5](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.5) / 2013-04-14
==================
  * Updating `node.extend` and `is`

[0.0.4](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.4) / 2013-04-08
==================
  * Updating `node.extend`, `tape`, `foreach`
  * Fixing a test

[0.0.3](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.3) / 2013-04-07
==================
  * Using `is` instead of `is-extended`
  * Using `foreach` shim instead of native forEach

[0.0.2](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.2) / 2013-04-03
==================
  * Adding dependency status; moving links to an index at the bottom
  * Fixing link in README
  * Updating `is-extended`; removing unused module
  * Adding an `npm` version badge

[0.0.1](https://github.com/ljharb/json-file-plus/releases/tag/v0.0.1) / 2013-04-01
==================
  * Initial implementation

