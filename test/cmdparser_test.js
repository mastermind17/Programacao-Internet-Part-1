'use strict';
const expect = require('expect.js');
const parser = require('../lib/cmd_parser');


describe('Parse of commands', function(){
    describe('parse with arguments', function(){
        it('should return a valid object when the options are correctly supplied', function(){
            let args = ['node', 'football-data.js',
                '-leagues', '"Primeira Liga 2015/16, PD"',
                "-generate", "teams,fixtures,leagueTable",
                "-usage", "-output", "somewhere"
            ];

            parser(args, (err, result) => {

                //expect no error
                expect(err).to.be(null);

                //match type
                expect(result).to.be.an('object');

                //match attributes
                expect(result.leagues).to.be.eql( ['"Primeira Liga 2015/16', ' PD"' ]);
                expect(result.generateOptions).to.be.eql(['teams','fixtures', 'leagueTable']);
                expect(result.outputPath).to.be.eql('somewhere');
                expect(result.showUsage).not.to.be(undefined)
            });

        });


        it('should return a valid object when the options are supplied by a file', () => {

            let args = [
                'node', 'football-data.js',
                '-file', 'test/file_to_read.txt'
            ];

            parser(args, (err, result) => {

                //expect no error
                expect(err).to.be(null);

                //match type
                expect(result).to.be.an('object');

                //match attributes
                expect(result.leagues).to.be.eql( ['"Primeira Liga 2015/16', ' PD"' ]);
                expect(result.generateOptions).to.be.eql(['teams','fixtures', 'leagueTable']);
                expect(result.outputPath).to.be.eql('somewhere');
                expect(result.showUsage).not.to.be(undefined)
            });
        });

    });

    describe('parse without arguments', () => {
        it('should return an object with just the usage and output properties assigned', () => {
            let args = [];
            parser(args, (err, command) => {

                //error variable is active
                expect(err).to.not.be(undefined);
                //error has a message as well
                expect(err.message).to.be('Not enough/valid arguments');

                expect(command.leagues).to.be(undefined);
                expect(command.generate).to.be(undefined);
                expect(command.outputPath).not.to.be(undefined);
                expect(command.showUsage).not.to.be(undefined);
                expect(command.outputPath).to.be('./output/');
            });
        });
    });
});
