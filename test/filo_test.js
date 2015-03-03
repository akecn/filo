/*global describe:true,it:true*/
/*
 * filo
 * https://github.com/akecn/filo
 *
 * Copyright (c) 2014 wuake
 * Licensed under the MIT license.
 */

'use strict';

var chai = require('chai');
chai.expect();
chai.should();

var path = require('path');

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

describe('filo module', function(){
    describe('#getFiles()', function(){
        it('should return array of File instance', function(){
            var filo = new Filo("test/resource/??a.js,b.js"),
                files = filo.files;
            files.should.be.a('array');
            files.should.have.length(2);

            files[0].url.should.equal(path.join(__dirname, 'resource/a.js'))
            files[1].url.should.equal(path.join(__dirname, 'resource/b.js'))
        });

        it('should coincident with different url', function() {
            var filo1 = new Filo("test/resource/??a.js,b.js"),
                filo2 = new Filo('test/??/resource/a.js,/resource/b.js');

            var content1 = filo1.output().toString(),
                content2 = filo2.output().toString();
            content1.should.equal(content2);
            content1.should.equal('console.log(1);console.log(2);');
        });
    });

    describe('#isAvailable()', function() {
        it('should return available state', function() {
            var filo1 = new Filo('test/resource/c.js');
            filo1.isAvailable().should.be.false();

            var filo2 = new Filo('test/resource/b.js');
            filo2.isAvailable().should.be.true();
        });

    });

    describe('#isAvailable()', function() {
        it('should return true with one file invalid', function() {
            var filo = new Filo('test/resource/??a.js,c.js');

            filo.isAvailable().should.be.true();
        });

        it('should return content of available file', function() {
            var filo = new Filo('test/resource/??b.js,c.js');

            filo.output().toString().should.equal('console.log(2);')
        });
    });

    describe('#combine()', function() {
        it('should combine content', function() {
            var filo = new Filo('test/resource/a.js');
            filo.output().toString().should.equal('console.log(1);');

            filo.files.should.be.a('array');
            filo.files.should.have.length(1);
            filo.combine('test/resource/b.js');

            filo.files.should.have.length(2);

            filo.output().toString().should.equal('console.log(1);console.log(2);')

        });
    });

    describe('#output()', function() {
        it('should return combine content of files', function() {
            var filo = new Filo('test/resource/??a.js,b.js');

            filo.output().toString().should.equal('console.log(1);console.log(2);');
        });
    });
});
