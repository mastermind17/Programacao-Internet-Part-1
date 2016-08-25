'use strict';
const expect = require('expect.js');
const webUtils = require('../lib/web_stuff/web_utils').utils;

describe('Web_Utils module', function(){

    describe('when requiring the utils property', function(){

       it('must be able to create simple tags, without content or properties', function(){
            let simpleTag = webUtils.selfClosedTag('hr');
            expect(simpleTag).to.be.eql('<hr/>');
            simpleTag = webUtils.tag('h1');
           expect(simpleTag).to.be.eql('<h1>');
       });

        it('must be able to create tags with content and/or properties', function(){
            let tag = webUtils.tagContent('h1', 'content goes here');
            expect(tag).to.be.eql('<h1>content goes here</h1>');
        });

    });

});