'use strict';
const Command = require('../lib/command');
const expect = require('expect.js');

describe('Command', function(){
  describe('ctor with default values', function(){
    it('must return an object with just the output and usage properties assigned', () => {
      let instance = new Command();
      expect(instance.leagues).to.be(undefined);
      expect(instance.generate).to.be(undefined);
      expect(instance.outputPath).not.to.be(undefined);
      expect(instance.outputPath).to.be('./output/')
      expect(instance.showUsage).not.to.be(undefined);
    });
  });
});
