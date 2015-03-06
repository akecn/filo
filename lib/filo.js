"use strict";

/**
 * filo
 * @file virtual object for multiple file
 * https://github.com/akecn/filo
 *
 * Copyright (c) 2014 wuake
 * Licensed under the MIT license.
 */

var _ = require('lodash'),
    minimatch = require("minimatch"),
    through2 = require('through2');

var fs = require('fs'),
    path = require('path'),
    Vinyl = require('vinyl');

function Filo(url, options) {
    if(!url) {
        throw new Error('url is required.');
    }

    options = _.defaults(options || {}, {
        cwd: process.cwd(),
        series: false
    });

    this.options = options;
    this.files = [];

    this._wrap();
    this.ext = path.extname(url);

    this.combine(url);
}

_.assign(Filo.prototype, {
    _wrap: function() {
        var options = this.options,
            series = options.series;

        Object.defineProperty(this, 'ext', {
            get: function() {
                return this.__ext || "";
            },
            set: function(v) {

                if(v && v !== this.ext) {

                    this.__ext = v;
                    this.files.forEach(function(file) {

                        Filo.extension(file, v, {
                            series: series
                        });
                    });
                }
            }
        });
    },

    _parsing: function(url) {
        var dir = "",
            urls = [{
                base: dir,
                path: url
            }];

        if(~url.indexOf("??")) {
            var parts = url.split('??');

            dir = parts[0];

            urls = parts[1].split(',').map(function(f) {
                return {
                    base: dir,
                    path: path.join(dir, f)
                }
            });
        }

        return urls;
    },

    combine: function(options) {
        if(typeof options === "string") {

            var items = this._parsing(options);

            items.forEach(this.combine.bind(this));
            return;
        }

        var File = Filo.File,
            file,
            ext = this.ext;
        options || (options = {});

        if(options instanceof File) {

            file = options;
        }else {

            file = new File({
                cwd: options.cwd || this.options.cwd,
                base: options.base,
                path: options.path
            });
        }

        if(this.extension(file) === ext) {
            this.files.push(file);

            if(!file.contents) {
                file.contents = Filo.readFile(file);
            }
            if(!file.stat) {
                file.stat = Filo.fileStat(file);
            }
        }
    },

    // todo optional `some` available or `every` available
    isAvailable: function() {
        return this.files.some(Filo.available);
    },

    output: function() {

        var bufs = [];
        this.files.forEach(function(file) {

            var contents = Filo.readFile(file);
            if(contents) {
                bufs.push(contents);
            }
        });

        if(bufs.length > 0) {
            return Buffer.concat(bufs);
        }else {
            return null;
        }
    },

    stream: function(options) {
        options || (options = {});
        var stream = through2.obj(options.transform, options.flush);

        var filter = options.filter && minimatch.filter(options.filter, {matchBase: true});

        this.files.forEach(function(file) {
            if(!filter || filter(file.path)) {
                stream.write(file);
            }
        });

        stream.end();

        return stream;
    }
});

var FileMethods = {
    getUrl: function(file) {
        return path.join(file.cwd, file.path);
    },

    extension: function(file, ext, options) {
        if(!file || !file.path) {return;}

        var old = path.extname(file.path);

        if(!ext) {
            return old;
        }

        if(ext.charAt(0) !== ".") {
            ext = "." + ext;
        }

        if(old !== ext) {
            file.path = file.path.replace(old, ext);

            if(options && options.series) {
                // NB: in vinyl, if new contents is falsy value, the `file.contents` will not change.
                file.contents = Filo.readFile(file);
                file.stat = Filo.fileStat(file);
            }
        }
    },

    available: function(file) {

        var stat = Filo.fileStat(file);

        return !!(stat && stat.isFile());
    },

    readFile: function(file) {
        if(file.contents) {
            return file.contents;
        }

        try {
            return fs.readFileSync(Filo.getUrl(file));
        }catch(ex) {
            return null;
        }
    },

    fileStat: function(file) {
        if(file.stat) {
            return file.stat;
        }
        try {
            return fs.statSync(Filo.getUrl(file));
        }catch(ex) {
            return null;
        }
    }
};

Filo.File = Vinyl;
_.assign(Filo, FileMethods);
_.assign(Filo.prototype, FileMethods);

module.exports = Filo;