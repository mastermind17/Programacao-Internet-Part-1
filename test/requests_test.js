'use strict'
const expect = require('expect.js');
const request = require('../lib/requests.js');

let testLeague1 = {
    _links: {
        self: {
            href: "http://api.football-data.org/alpha/soccerseasons/399"
        },
        teams: {
            href: "http://api.football-data.org/alpha/soccerseasons/399/teams"
        },
        fixtures: {
            href: "http://api.football-data.org/alpha/soccerseasons/399/fixtures"
        },
        leagueTable: {
            href: "http://api.football-data.org/alpha/soccerseasons/399/leagueTable"
        }
    },
    caption: "Primera Division 2015/16",
    league: "PD",
    year: "2015",
    numberOfTeams: 20,
    numberOfGames: 380,
    lastUpdated: "2015-11-23T05:26:30Z"
}

let testLeague2 = {
    _links: {
        self: {
            href: "http://api.football-data.org/alpha/soccerseasons/402"
        },
        teams: {
            href: "http://api.football-data.org/alpha/soccerseasons/402/teams"
        },
        fixtures: {
            href: "http://api.football-data.org/alpha/soccerseasons/402/fixtures"
        },
        leagueTable: {
            href: "http://api.football-data.org/alpha/soccerseasons/402/leagueTable"
        }
    },
    caption: "Primeira Liga 2015/16",
    league: "PPL",
    year: "2015",
    numberOfTeams: 18,
    numberOfGames: 306,
    lastUpdated: "2015-11-13T07:46:11Z"
}

let testLeague3 = {
    _links: {
        self: {
            href: "http://api.football-data.org/alpha/soccerseasons/394"
        },
        teams: {
            href: "http://api.football-data.org/alpha/soccerseasons/394/teams"
        },
        fixtures: {
            href: "http://api.football-data.org/alpha/soccerseasons/394/fixtures"
        },
        leagueTable: {
            href: "http://api.football-data.org/alpha/soccerseasons/394/leagueTable"
        }
    },
    caption: "1. Bundesliga 2015/16",
    league: "BL1",
    year: "2015",
    numberOfTeams: 18,
    numberOfGames: 306,
    lastUpdated: "2015-11-23T05:26:36Z"
}

let leaguesArray = [testLeague1, testLeague2, testLeague3];

let expectedLeague = testLeague1;

let expectedTeam = {
    _links: {
        self: {
            href: "http://api.football-data.org/alpha/teams/560"
        },
        fixtures: {
            href: "http://api.football-data.org/alpha/teams/560/fixtures"
        },
        players: {
            href: "http://api.football-data.org/alpha/teams/560/players"
        }
    },
    name: "RC Deportivo La Coruna",
    code: "LAC",
    shortName: "La Coruna",
    squadMarketValue: "52,200,000 €",
    crestUrl: "http://upload.wikimedia.org/wikipedia/en/4/4e/RC_Deportivo_La_Coruña_logo.svg"
}


describe('Request Resources', function() {
    describe('Request teams', function() {
        it('must have the correct league: Primera Division 2015/16', function() {
            let league = ['PD']; // selected league
            let option = 'teams'; // command line command
            let requestCb = {
                teams: testRequest
            }
            request(leaguesArray, option, requestCb);
            function testRequest(respectiveLeague, teamsObj) {
                expect(respectiveLeague).to.be.an('object');
                // test corresponding league: Primera Division 2015/16
                expect(respectiveLeague).to.be.eq(expectedLeague);
            }
        })
        it('must have the correct team: RC Deportivo La Coruna', function() {
            let league = ['PD']; // selected league
            let option = 'teams'; // command line command
            let requestCb = {
                teams: testRequest
            }
            request(leaguesArray, option, requestCb);
            function testRequest(respectiveLeague, teamsObj) {
                expect(teamsObj).to.be.an('object');
                // test 1st team: RC Deportivo La Coruna
                expect(teamsObj[0]).to.be.eq(expectedTeam);
            }
        })
    })
});
