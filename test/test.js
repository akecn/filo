/*global describe:true,it:true*/
/*
 * filo
 * https://github.com/akecn/filo
 *
 * Copyright (c) 2014 wuake
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');

var path = require('path');
var through2 = require('through2');
var Filo = require('../lib/filo.js');


/**
 a
 a/b
 a/b/c.js
 ??a/b/c.js
 a/b/c.js?xx=1&yy=2
 ??/a/b/c.js,d.js?xx=1&yy=2
 /??/a/b/c.js,d.js?xx=1&yy=2
 /a/??b/c.js,d.js?xx=1&yy=2
 */
//var file = new VFile('/node_modules/connect-livereload/README.md', {
//    cwd: path.resolve(__dirname, "../")
//});
//console.log(file.getFiles());
//console.log(file.output().toString());
var cwd = __dirname;

describe('filo instance', function(){
    describe('filo.getFiles()', function(){
        it('should return array of File instance', function(){
            var filo = new Filo("resource/??a.js,b.js", {
                    cwd: cwd
                }),
                files = filo.files;
            files.should.be.an.Array;
            files.should.have.length(2);

            filo.getUrl(files[0]).should.equal(path.join(cwd, 'resource/a.js'));
            filo.getUrl(files[1]).should.equal(path.join(cwd, 'resource/b.js'));

            (files[0] instanceof Filo.File).should.be.true;
            (files[1] instanceof Filo.File).should.be.true;
        });

        it('should coincident with different url', function() {
            var filo1 = new Filo("resource/??a.js,b.js", {
                    cwd: cwd
                }),
                filo2 = new Filo('??resource/a.js,resource/b.js', {
                    cwd: cwd
                });

            filo1.files[0].path.should.equal(filo2.files[0].path);
            filo1.files[1].path.should.equal(filo2.files[1].path);

            var content1 = filo1.output().toString(),
                content2 = filo2.output().toString();
            content1.should.equal(content2);
            content1.should.equal('console.log(1);console.log(2);');
        });
    });

    describe('filo.isAvailable()', function() {
        it('should return available state', function() {
            var filo1 = new Filo('resource/c.js', {
                cwd: cwd
            });
            filo1.isAvailable().should.be.false;

            var filo2 = new Filo('resource/b.js', {
                cwd: cwd
            });
            filo2.isAvailable().should.be.true;
        });

        it('should return true with one file invalid', function() {
            var filo1 = new Filo('resource/??a.js,c.js', {
                cwd: cwd
            });

            filo1.isAvailable().should.be.true;

            var filo2 = new Filo('invalid/??a.js,c.js', {
                cwd: cwd
            });
            filo2.isAvailable().should.be.false;
        });

    });

    describe('filo.combine()', function() {
        it('should combine content', function() {
            var filo = new Filo('resource/a.js', {
                cwd: cwd
            });
            filo.output().toString().should.equal('console.log(1);');

            filo.files.should.be.an.Array;
            filo.files.should.have.length(1);

            filo.combine('resource/b.js');
            filo.files.should.have.length(2);

            filo.output().toString().should.equal('console.log(1);console.log(2);')

            filo.combine('resource/c.js');
            filo.files.should.have.length(3);

            filo.combine('resource/t.coffee');
            // because filo.ext === ".js"
            filo.files.should.have.length(3);

        });
    });

    describe('filo.output()', function() {
        it('should return combine content of files', function() {
            var filo = new Filo('resource/??a.js,b.js', {
                cwd: cwd
            });

            filo.output().toString().should.equal('console.log(1);console.log(2);');
        });

        it('should return content of available file', function() {
            var filo = new Filo('resource/??b.js,c.js', {
                cwd: cwd
            });

            filo.output().toString().should.equal('console.log(2);')
        });
    });

    describe('filo.ext property', function() {
        it('should change file extension when ext property changed', function() {
            var filo = new Filo('resource/??a.js,b.js', {
                cwd: cwd
            });

            filo.files.should.have.length(2);
            filo.extension(filo.files[0]).should.be.equal('.js');
            filo.extension(filo.files[1]).should.be.equal('.js');

            filo.ext = ".coffee";

            filo.extension(filo.files[0]).should.be.equal('.coffee');
            filo.extension(filo.files[1]).should.be.equal('.coffee');

            filo.combine('resource/t.coffee');
            filo.files.should.have.length(3);

            filo.output().toString().should.be.equal('console.log(1);console.log(2);console.log("t");');
        });
    });

    describe('filo.stream()', function() {
        it('should return stream, and pipe file', function() {
            var filo = new Filo('resource/??a.js,b.js', {
                cwd: cwd
            });

            var filePath = [],
                fileContents = [];

            filo.stream().pipe(through2.obj(function(file, enc, callback) {
                filePath.push(file.path);
                fileContents.push(file.contents);

                callback(null, file);
            }, function() {

                filePath[0].should.be.equal('resource/a.js');
                filePath[1].should.be.equal('resource/b.js');

                fileContents[0].toString().should.be.equal('console.log(1);');
                fileContents[1].toString().should.be.equal('console.log(2);');
            }));

            var filePath2 = [],
                fileContents2 = [];
            filo.stream({
                filter: "a.js"
            }).pipe(through2.obj(function(file, enc, callback) {
                filePath2.push(file.path);
                fileContents2.push(file.contents);

                callback(null, file);
            }, function() {

                filePath2[0].should.be.equal('resource/a.js');
                should.not.exist(filePath2[1]);

                fileContents2[0].toString().should.be.equal('console.log(1);');
                should.not.exist(fileContents2[1]);
            }));
        });
    });
});

describe('Filo Class', function() {
    describe('Filo.getUrl()', function() {
        it('should return url of file', function() {
            var filo = new Filo('resource/??a.js,b.js', {
                cwd: cwd
            });

            filo.getUrl(filo.files[0]).should.equal(path.join(filo.files[0].cwd, filo.files[0].path));
            filo.getUrl(filo.files[1]).should.equal(path.join(filo.files[1].cwd, filo.files[1].path));

            var file = new Filo.File({
                cwd: cwd,
                path: "test/a.js"
            });
            Filo.getUrl(file).should.equal(path.join(file.cwd, file.path));
        });
    });

    describe('Filo.extension()', function() {
        it('should get or set file extension', function() {
            var filo = new Filo('resource/??a.js,b.js', {
                cwd: cwd
            });
            var file1 = filo.files[0],
                file2 = filo.files[1];

            Filo.extension(file1).should.be.equal(filo.extension(file1));
            Filo.extension(file1).should.be.equal(Filo.extension(file2));

            Filo.extension(file1, 'css');
            file1.path.should.be.equal('resource/a.css');
            Filo.extension(file2, '.md');
            file2.path.should.be.equal('resource/b.md');
        })
    });

    describe('Filo.available()', function() {
        it('should return true if is exists and isFile, else return false', function() {
            var filo = new Filo('resource/??a.js,c.js', {
                cwd: cwd
            });
            var file1 = filo.files[0],
                file2 = filo.files[1];

            Filo.available(file1).should.be.true;
            Filo.available(file2).should.be.false;

            var filo2 = new Filo('resource/', {
                cwd: cwd
            });

            Filo.available(filo2.files[0]).should.be.false;
        });
    });

    describe('Filo.readFile()', function() {
        it('should read file content and return buffer', function() {
            var filo = new Filo('resource/??a.js,b.js', {
                cwd: cwd
            });
            var file1 = filo.files[0];

            Filo.readFile(file1).toString().should.be.equal('console.log(1);');

            var file = new Filo.File({
                cwd: cwd,
                path: 'resource/t.coffee'
            });

            should.not.exist(file.contents);

            file.contents = Filo.readFile(file);

            file.contents.toString().should.be.equal('console.log("t");');
        });
    });

    describe('Filo.fileStat()', function() {
        it('should return file stat', function() {
            var filo = new Filo('resource/??a.js,b.js', {
                cwd: cwd
            });
            var file1 = filo.files[0];
            var stat = Filo.fileStat(file1);
            stat.isDirectory().should.be.false;
            stat.isFile().should.be.true;

            var file = new Filo.File({
                cwd: cwd,
                path: 'resource/t.coffee'
            });
            file.stat = Filo.fileStat(file);

            file.stat.isDirectory().should.be.false;
            file.stat.isFile().should.be.true;
        });
    });
});
