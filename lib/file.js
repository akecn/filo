var fs = require('fs'),
    path = require('path');
var _ = require('lodash');

function File(options) {
    options || (options = {});

    this.cwd = options.cwd;
    this.dir = options.dir;
    this.ext = options.ext;
    this.name = options.name;

    var url = options.url;
    if(!this.ext) {
        this.ext = path.extname(url);
    }

    this.base = url.replace(this.ext, "");
}

_.assign(File.prototype, {
    _read: function() {
        if(this.isAvailable()) {
            return fs.readFileSync(this.url)
        }else {
            return null;
        }
    },

    isAvailable: function() {
        var rt = false;
        try {
            var stats = fs.lstatSync(this.url);

            if(stats.isFile()) {
                rt = true;
            }

        }catch(ex) {}

        return rt;
    },

    read: function() {
        var contents = this.contents;

        if(!contents) {
            contents = this.contents = this._read();
        }

        return contents;
    },

    toString: function() {
        var contents = this.contents || this.read();

        if(contents) {

            return contents.toString();
        }else {
            return null;
        }
    }
});


"cwd dir base ext".split(' ').forEach(function(name) {
    var getFn = function() {
        return this["__" + name] || "";
    };

    var setFn = function(v) {
        this["__" + name] = v;
        this["__url"] = path.join(this.cwd, this.dir, this.base + this.ext);
    };

    Object.defineProperty(File.prototype, name, {
        enumerable: true,
        get: getFn,
        set: setFn
    });
});

Object.defineProperty(File.prototype, 'url', {
    enumerable: true,
    get: function() {
        return this.__url;
    }
});

module.exports = File;