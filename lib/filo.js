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
    through2 = require('through2');

var fs = require('fs'),
    path = require('path'),
    File = require('./file');

function Filo(url, options) {
    options = _.defaults(options || {}, {
        cwd: path.resolve('.')
    });

    var dispose = this._parsing(url);

    this.options = options;
    this.files = [];

    dispose.files.forEach(function(file) {
        this.combine({
            base: dispose.base,
            path: file
        });
    }.bind(this));
}

function isComboPath(url) {
    return ~url.indexOf("??");
}

_.assign(Filo.prototype, {
    _parsing: function(url) {
        var urls = [],
            dir = "";
        if(isComboPath(url)) {
            var parts = url.split('??');

            dir = parts[0];

            urls = parts[1].split(',').map(function(f) {
                return path.join(dir, f);
            });
        }else {
            urls.push(url);
        }

        return {
            files: urls,
            base: dir
        };
    },

    combine: function(options) {
        var file;

        if(options instanceof File) {

            file = options;
        }else {

            if (typeof options === "string") {
                options = {
                    path: options
                };
            }

            if (!options || !options.path) {
                return null;
            }

            file = new File({
                cwd: options.cwd || this.options.cwd,
                base: options.base || "",
                path: options.path
//                stat: null,
//                contents: null
            });
            file.path = file.path;
        }

        this.files.push(file);

        return file;
    },

    isAvailable: function() {
        return this.files.some(function(file) {
            return file.isAvailable();
        });
    },

    stream: function(options) {
        options || (options = {});
        var stream = through2.obj(options.transform, options.flush);

        this.files.forEach(function(file) {
            stream.write(file);
        });
        stream.end();

        return stream;
    },

    output: function() {

        var bufs = [];
        this.files.forEach(function(file) {

            var contents = file.output();
            if(contents) {
                bufs.push(contents);
            }
        });

        if(bufs.length > 0) {
            return Buffer.concat(bufs);
        }else {
            return null;
        }
    }
});

module.exports = Filo;

//new Filo('test/resource/??a.js,b.js');