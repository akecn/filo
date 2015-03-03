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
        this.concat({
            dir: dispose.dir,
            url: file
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

            urls = parts[1].split(',');
        }else {
            urls.push(url);
        }

        return {
            files: urls,
            dir: dir
        };
    },

    concat: function(options) {
        if(typeof options === "string") {
            options = {
                url: options
            };
        }

        if(!options || !options.url) {
            return null;
        }

        var file = new File({
            cwd: options.cwd || this.options.cwd,
            dir: options.dir || "",
            url: options.url
        });

        this.files.push(file);

        return file;
    },

    stream: function(transform, flush) {
        var stream = through2.obj(transform, flush);

        this.files.forEach(function(file) {
            stream.write(file);
        });
        stream.end();

        return stream;
    },

    output: function() {

        var bufs = [];
        this.files.forEach(function(file) {

            var contents = file.read();
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