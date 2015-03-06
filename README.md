## usage

_sorry for my poor english_

```javascript
new Filo(url, options);
```

url format:

 * test.js
 * test/resource/a.js
 * test/??resource/a.js,b.js

example:

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

_detail in `test/test.js`_

## Notice

* `filo.files` is instance of `Vinyl`.
* `filo.files` should have the same extension with `filo.ext`.
* if you set `filo.ext` with a different value. all the file will change the extension of `file.path`.

## Tests

To run tests run:

```bash
gulp test
```