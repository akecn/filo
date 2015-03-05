"use strict";

var fs = require('fs'),
    path = require('path'),
    util = require('util');
var _ = require('lodash'),
    Vinyl = require('vinyl');

// -----------------------------------------
//  cwd / base / path
//            ____|____
//           |         |
//          dir  /  filename(virtual)
//                 ____|____
//                |         |
//              name       ext
//
// when set `path` property, auto set below properties:
//
// dir = Path.basename(path)
// <del>filename = Path.basename(path)</del>
// ext = Path.extname(path)
// name = Path.basename(path, ext);
// relative === Path.relative(base, path)
// -----------------------------------------

function File(options) {
    options || (options = {});

    Vinyl.call(this, options);
}

util.inherits(File, Vinyl);

_.assign(File.prototype, {
    _read: function() {
        if(this.isAvailable()) {
            return fs.readFileSync(this.url)
        }else {
            return null;
        }
    },

    _stat: function() {
        if(!this.stat) {
            this.stat = fs.statSync(this.url);
        }
        return this.stat;
    },

    isAvailable: function() {
        var rt = false;
        try {
            var stats = this._stat();

            if(stats.isFile()) {
                rt = true;
            }

        }catch(ex) {}

        return rt;
    },

    output: function() {
        var contents = this.contents;

        if(!contents) {
            contents = this.contents = this._read();
        }

        return contents;
    }

});

//Object.defineProperty(File.prototype, 'stat', {
//    enumerable: true,
//    get: function() {
//        return this.__stat;
//    },
//    set: function(stat) {
//        this.__stat = stat;
//    }
//});

// from vinyl
Object.defineProperty(File.prototype, 'path', {
    get: function() {
        return this.history[this.history.length - 1];
    },
    set: function(v) {
        if (typeof v !== 'string') throw new Error('path should be string');

        // record history only when path changed
//        if (v && v !== this.path) {
//            this.history.push(v);
//        }

        if(v && (v !== this.path || !this.__inited)) {
            this.dir = path.dirname(v);
            this.ext = path.extname(v);
            this.name = path.basename(v, this.ext);

            this.__inited = true;
        }
    }
});

Object.defineProperty(File.prototype, 'url', {
    get: function() {
        if(!this.cwd || !this.base || !this.path) {
            throw new Error('File.url required cwd and path attribute');
        }
        return path.join(this.cwd, this.path);
    },
    set: function() {
        throw new Error('File.url is generated from the cwd and path attributes. Do not modify it.');
    }
});

"dir name ext".split(' ').forEach(function(name) {
    var getFn = function() {
        return this["__" + name] || "";
    };

    var setFn = function(v) {
        this["__" + name] = v;
        var f = path.join(this.dir, this.name + this.ext);
        if(this.dir && this.name && this.ext && f !== this.path) {
            this.history.push(f);
        }
    };

    Object.defineProperty(File.prototype, name, {
        enumerable: true,
        get: getFn,
        set: setFn
    });
});

module.exports = File;