Filo
============

## usage

```javascript
new Filo(url, options);
```

url format:

 * test.js
 * test/resource/a.js
 * test/??resource/a.js,b.js

### example

```javascript
var Filo = require('filo');
var filo = new Filo("a.js", {
    cwd: __dirname
});
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