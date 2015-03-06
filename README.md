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

_detail in `test/filo_test.js`_

## methods for multiple file

### `filo.isAvailable` 

return `true` if have one file available at least.
 
### `filo.combine(params)`

add file in `filo` object.

params could be file url, or Vinyl constructor options.

NB: the file extension should be the same with `filo.ext`.

### `filo.output()`

read every file, and concat the contents.

### `filo.stream(options)`

the method will return a stream. and pipe the file through transform function.

`options.filter` will filter the file. 

## Notice

* `filo.files` is instance of `Vinyl`.
* `filo.files` should have the same extension.
* if you set `filo.ext` a different value. all the file will change the extension of `file.path`.

## Tests

To run tests run:

```bash
gulp test
```