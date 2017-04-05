# deepcopy.js

[![Build Status](https://travis-ci.org/sasaplus1/deepcopy.js.svg)](https://travis-ci.org/sasaplus1/deepcopy.js)
[![Dependency Status](https://gemnasium.com/sasaplus1/deepcopy.js.svg)](https://gemnasium.com/sasaplus1/deepcopy.js)
[![NPM version](https://badge.fury.io/js/deepcopy.svg)](http://badge.fury.io/js/deepcopy)

deep copy for any data

## Playground

[REPL powered by Tonic](https://tonicdev.com/npm/deepcopy)

## Installation

```sh
$ npm install deepcopy
```

## Usage

### node.js

```js
var deepcopy = require("deepcopy");
```

### browser

```html
<script src="deepcopy.min.js"></script>
```

### Example

basic usage:

```js
var base, copy;

base = {
  desserts: [
    { name: "cake"      },
    { name: "ice cream" },
    { name: "pudding"   }
  ]
};

copy = deepcopy(base);
base.desserts = null;

console.log(base);
// { desserts: null }
console.log(copy);
// { desserts: [ { name: 'cake' }, { name: 'ice cream' }, { name: 'pudding' } ] }
```

customize deepcopy:

```js
function MyClass(id) {
  this._id = id;
}

var base, copy;

base = {
  myClasses: [
    new MyClass(1),
    new MyClass(2),
    new MyClass(3)
  ]
};

copy = deepcopy(base, function(target) {
  if (target.constructor === MyClass) {
    return new MyClass(target._id);
  }
});
base.myClasses = null;

console.log(base);
// { myClasses: null }
console.log(copy);
// { myClasses: [ MyClass { _id: 1 }, MyClass { _id: 2 }, MyClass { _id: 3 } ] }
```

## Functions

### deepcopy(value[, customizer])

- `value`
  - `*` - target value
- `customizer`
  - `Function` - customize function
- `return`
  - `*` - copied value

support types are below:

- Number
- String
- Boolean
- Null
- Undefined
- Function
  - shallow copy if it is native function
- Date
- RegExp
- Array
  - support recursive copy
  - also can copy if it has circular reference
- Object
  - support recursive copy
  - also can copy if it has circular reference
- Buffer (node.js only)
- Symbol

## Test

```sh
$ npm install
$ npm test
```

## Contributors

- [kjirou](https://github.com/kjirou)

## License

The MIT license. Please see LICENSE file.
