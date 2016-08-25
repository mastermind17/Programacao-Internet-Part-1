'use strict';

const webUtils = require('./web_utils').utils;
const path = require('path');

/*
The exported functions.
 */
module.exports = {
    buildTeamPage       : buildTeamDetailPage,
    buildLeagueTable    : buildLeagueTablePage,
    buildLeaguesPage    : buildLeaguesPage,
    buildIndexPage      : buildIndexPage,
    buildLeagueFixtures : buildLeagueFixtures,
    buildPlayersPage    : buildPlayersPage
};

const stylesheetDir = './assets';

const stylesheetName = 'main.css';

const goUpInDirectory = '..';

const productionStyleSheetPath = function(styleName){
    return path.join(goUpInDirectory, stylesheetDir, styleName);
};

module.exports.assetsDir = stylesheetDir;

module.exports.mainStyleSheet = stylesheetName;


/**
 * Builds an html page with links for the selected leagues
 * 
 * @param   {Array} Json Array of the selected leagues
 * @returns {String} Html page
 */
function buildIndexPage(leagues) {
    let content = webUtils.initPage('Index', productionStyleSheetPath(stylesheetName));
    content += webUtils.tag('body');

    leagues.forEach((league) => {
        let leagueUrl = formUriToLeague(league.league);
        content += webUtils.tagContent('h1', webUtils.anchor(leagueUrl, league.caption));
    });
    content += webUtils.closePage();
    return content;

    function formUriToLeague(sigla) {
        const paths = require('./../writer').paths;
        return path.join('.', paths.toLeagues, sigla + '.html');
    }
}


/**
 * The main routine that builds the page which contains the details
 * about a certain team.
 *
 * @param {String} leagueName League's name
 * @param {Object} team Team from which the details are taken from
 * @returns {String} Html page
 */
function buildTeamDetailPage(leagueName, team) {
    let content = webUtils.initPage(team.name, productionStyleSheetPath(stylesheetName));
    content += webUtils.tag('body');
    content += webUtils.tagContent('h1', leagueName);
    content += buildSingleTeamContainer(team);
    content += webUtils.closePage();
    return content;

    /**
     * Given a team object, returns it's html representation
     * @param teamObj Team
     * @param linkable Specify if the container should have an hiperlink to the detailed resource.
     */
    function buildSingleTeamContainer(teamObj) {
        let container = webUtils.tagWithClass('div', 'team_card');
        container += webUtils.imageTag(teamObj.crestUrl);

        container += buildListOfDetails(teamObj);
        container += webUtils.closeTag('div');

        let uriToPlayers = formUriToPlayersPage(teamObj);
        container += webUtils.tagContent('h3', webUtils.anchor(uriToPlayers, 'See Players'));
        return container;
    }

    function formUriToPlayersPage(team) {
        const paths = require('./../writer').paths;
        const format = require('./../writer').utils.formatName;
        let resourceName = format(team.name) + 'Players.html';
        let uriToPlayers = path.join(goUpInDirectory, paths.toPlayers, resourceName);
        return uriToPlayers;
    }

    /**
     * Build an html representation of a list of details 
     * based upon the team object given as parameter.
     *
     * @param team Team to extract the details from
     * @param toDecorate If true, specifies that the content must
     *                 contain an hyperlink to the detail's page
     *
     * @returns {string} Html list with details as content
     */
    function buildListOfDetails(team) {
        let resourceName = team.name;
        return webUtils.tag('ul') +
            webUtils.tagContent('li', resourceName) +
            webUtils.tagContent('li', team.shortName) +
            webUtils.tagContent('li', team.squadMarketValue) +
            webUtils.closeTag('ul');
    }
}


/**
 * Builds the fixtures html page for a give league.
 * It creates a table for each week with the respective games in it.
 * 
 * @param {Object} league Json object of a league
 * @param {Array} fixtures Json array of fixtures
 * @returns {string} Html page
 */
function buildLeagueFixtures(league, fixtures){
    let content = webUtils.initPage(league.caption, productionStyleSheetPath(stylesheetName));
    content += webUtils.tag('body');

    let weekFixtures = [];
    let gamesPerWeek = league.numberOfTeams/2;
    let count = 0;
    
    fixtures.forEach((fixture) => {
        count++;
        weekFixtures.push(fixture);
        if(count%gamesPerWeek == 0){
            let tableTitle = webUtils.tagContent('h1', 'Week '+fixture.matchday);
            let table = buildFixtureTable(weekFixtures);
            content += tableTitle + table;
            weekFixtures = [];
        }
    });
    content += webUtils.closeTag('body');
    return content + webUtils.tag('html');

    /**
     * Builds an html page that contains the games for this fixture respective week.
     * 
     * @param {Object} fixture Json object
     * @returns {string} Html table
     */
    function buildFixtureTable(fixture){
        let table = webUtils.tagWithClass('table', 'center_content');
        let tableHead = initFixturesTableHeaders();
        let tableDataBody = fulfillFixtureTable(fixture);
        return table + tableHead + tableDataBody + webUtils.closeTag('table');
    }

    function initFixturesTableHeaders(){
        let content = webUtils.tag('thead');
        content += webUtils.tag('tr') + webUtils.tagContent('th', "Date");
        content += webUtils.tagContent('th', "Home");
        content += webUtils.tagContent('th', "Score");
        content += webUtils.tagContent('th', "Away");
        content += webUtils.tagContent('th', "Time");
        return content + webUtils.closeTag('tr') + webUtils.closeTag('thead');
    }

    function fulfillFixtureTable(weekFixtures){
        const paths = require('./../writer').paths;
        const writerUtils = require('../writer').utils;
        let content = webUtils.tag('tbody');
        weekFixtures.forEach((game) => {
            content += webUtils.tag('tr');
            content += webUtils.tagContent('td', game.date.slice(5,10));
            let url = path.join(goUpInDirectory, paths.toTeams, writerUtils.formatName(game.homeTeamName));
            url += paths.extension;
            content += webUtils.tagContent('td', webUtils.anchor(url, game.homeTeamName));
            content += webUtils.tagContent('td', buildScore(game));
            url = path.join(goUpInDirectory, paths.toTeams, writerUtils.formatName(game.awayTeamName));
            url += paths.extension;
            content += webUtils.tagContent('td', webUtils.anchor(url, game.awayTeamName));
            content += webUtils.tagContent('td', game.date.slice(11,16));
            content += webUtils.closeTag('tr');
        });
        return content + webUtils.closeTag('tbody');
    }

    /**
     * Returns the game's respective score, depending if its finished or not.
     * @param {Object} gameObj Json object of a game
     * @returns {string} game's score
     */
    function buildScore(gameObj){
        if(gameObj.status != 'FINISHED')    return ' - ';
        return gameObj.result.goalsHomeTeam + ' - ' + gameObj.result.goalsAwayTeam;
    }
}


/**
 * Builds an html page for the players of a give team.
 * The players are grouped together in four sectores:
 * Keepers, defenders, midfielders and fowards.
 * Its created a table for each one.
 * 
 * @param {Object} team Json object.
 * @param {Array} players Json Array of the players for the give league.
 * @returns {String} Html page
 */
function buildPlayersPage(team, players)
{
    let playersArray = players.players;
    let content = webUtils.initPage('team', productionStyleSheetPath(stylesheetName));
    content += webUtils.tag('body');
    content += webUtils.tagContent('h1', team.name);

    let positions = {
        keepers : [],
        defenders : [],
        midfielders : [],
        fowards : []
    }

    playersArray.forEach((player) => {
        switch(player.position)
        {
            case 'Keeper':
                positions.keepers.push(player);
                break;
            case 'Centre Back':
            case 'Right-Back':
            case 'Left-Back':
                positions.defenders.push(player);
                break;
            case 'Attacking Midfield':
            case 'Left Midfield':
            case 'Defensive Midfield':
            case 'Central Midfield':
                positions.midfielders.push(player);
                break;
            case 'Centre Foward':
            case 'Right Wing':
            case 'Left Wing':
                positions.fowards.push(player);
                break;
            default:
                break;
        }
    });

    for(let key in positions){
        let tableTitle = webUtils.tagContent('h1', key);
        let table = buildPlayersTable(positions[key]);
        content += tableTitle + table;
    }
    content += webUtils.closeTag('body');
    return content + webUtils.tag('html');


    function buildPlayersTable(players){
        let table = webUtils.tagWithClass('table', 'center_content')
        let tableHead = initPlayersTableHeaders();
        let tableDataBody = fulfillPlayersTable(players);
        return table + tableHead + tableDataBody + webUtils.closeTag('table');
    }

    function initPlayersTableHeaders(){
        let content = webUtils.tag('thead');
        content += webUtils.tag('tr') + webUtils.tagContent('th', "No.");
        content += webUtils.tagContent('th', "Name");
        content += webUtils.tagContent('th', "Position");        
        content += webUtils.tagContent('th', "Country");
        content += webUtils.tagContent('th', "Age");
        return content + webUtils.closeTag('tr') + webUtils.closeTag('thead');
    }

    function fulfillPlayersTable(players){
        let content = webUtils.tag('tbody');
        players.forEach((player) => {
            content += webUtils.tag('tr');
            content += webUtils.tagContent('td', player.jerseyNumber);
            content += webUtils.tagContent('td', player.name);
            content += webUtils.tagContent('td', player.position);            
            content += webUtils.tagContent('td', player.nationality);
            content += webUtils.tagContent('td', calculateAge(new Date(player.dateOfBirth)));
            content += webUtils.closeTag('tr');
        });
        return content + webUtils.closeTag('tbody');
    }

    function calculateAge(dateOfBirth){
        let ageDifMs = Date.now() - dateOfBirth.getTime();
        let ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

}


/**
 * The main routine that builds the html page containing the league table.
 *
 * @param {Object} leagueTable The league table object from which the information is taken from.
 * @returns {String} Html table representing a league table
 */
function buildLeagueTablePage(leagueTable) {
    let content = webUtils.initPage(leagueTable.leagueCaption, productionStyleSheetPath(stylesheetName));

    let pageTitle = webUtils.tagContent('h1', leagueTable.leagueCaption);

    let wrapTable = webUtils.wrapWithClass('div', 'center_content', buildTable(leagueTable.standing));

    content += webUtils.tagContent('body', pageTitle + wrapTable);
    return content + webUtils.closeTag('html');


    function buildTable(standings) {
        let tableHead = initLeagueTableHeaders();
        let tableDataBody = fulfillLeagueTable(standings);
        let table = webUtils.tagWithClass('table', 'center_content');
        return table + tableHead + tableDataBody + webUtils.closeTag('table');
    }

    function initLeagueTableHeaders() {
        let content = webUtils.tag('thead');
        content += webUtils.tag('tr') + webUtils.tagContent('th', "Position");
        content += webUtils.tagContent('th', "Team Name");
        content += webUtils.tagContent('th', "Wins");
        content += webUtils.tagContent('th', "Draws");
        content += webUtils.tagContent('th', "Losses");
        content += webUtils.tagContent('th', "Goals");
        content += webUtils.tagContent('th', "Points");
        return content + webUtils.closeTag('tr') + webUtils.closeTag('thead');
    }

    function fulfillLeagueTable(standings) {
        const paths = require('./../writer').paths;
        const writerUtils = require('../writer').utils;
        let content = webUtils.tag('tbody');

        standings.forEach((team) => {
            content += webUtils.tag('tr');
            content += webUtils.tagContent('td', team.position);

            let url = path.join(goUpInDirectory, paths.toTeams, writerUtils.formatName(team.teamName));
            url += paths.extension;
            content += webUtils.tagContent('td', webUtils.anchor(url, team.teamName));

            content += webUtils.tagContent('td', team.wins);
            content += webUtils.tagContent('td', team.draws);
            content += webUtils.tagContent('td', team.losses);
            content += webUtils.tagContent('td', team.goals);
            content += webUtils.tagContent('td', team.points);
            content += webUtils.closeTag('tr');
        });

        return content + webUtils.closeTag('tbody');
    }
}

/**
 * Builds an html page for a league.
 * It contains links to the respective league table and fixtures.
 * 
 * @param  {object} selectedLeague An object that represents a certain league.
 * @returns {string} Html page.
 */
function buildLeaguesPage(selectedLeague) {
    let page = webUtils.initPage(selectedLeague.caption, productionStyleSheetPath(stylesheetName));
    page += webUtils.tag('body');
    page += webUtils.tagContent('h1', selectedLeague.caption);

    let pathToLeagueTables = require('../writer').paths.toLeagueTables;
    let leagueTableUri = goUpInDirectory + pathToLeagueTables + selectedLeague.league + '.html';
    page += webUtils.tagContent('h2', webUtils.anchor(leagueTableUri, 'League Table'));

    let pathToFixtures = require('../writer').paths.toFixtures;
    let fixturesUri = goUpInDirectory + pathToFixtures + selectedLeague.league + '.html';
    page += webUtils.tagContent('h2', webUtils.anchor(fixturesUri, 'Fixtures'));

    page += webUtils.closePage();
    return page;
}