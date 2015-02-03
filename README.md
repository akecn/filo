Filo
============

## usage

url can be one of below:

```
test.js
test/resource/a.js
test/??resource/a.js,b.js
```

### example

```
var Filo = require('filo');
var filo = new Filo("a.js");
if(filo.isAvailable()) {
    filo.output(); // return file buffer
}

filo.combine('b.js');
filo.output(); // module `a` and `b` combine;
```

_detail in `test/filo_test.js`_

## Tests

To run tests run:

```bash
gulp test
```