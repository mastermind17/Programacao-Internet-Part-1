'use strict';

/*
Node internal modules
 */
const fs = require('fs');
const path = require('path');
const inspect = require('util').inspect;

/**
 *  To be assigned as soon as we know if we should use bootstrap or our own css styles.
 */
let pagemaker = null;


//isto devia ser um objecto para depois exportar mais abaixo
const pathToTeams = '/teams/',
      pathToPlayers = '/teams/',
      pathToLeagues = '/leagues/',
      pathToLeagueTable = '/leagueTables/',
      pathToFixtures = '/fixtures/';
const extension = '.html';

/*
The exported ctor function.
 */
module.exports.writer = Writer;

/*
The exported constants.
 */
module.exports.paths = {
    toTeams : pathToTeams,
    toPlayers : pathToPlayers,
    toLeagues : pathToLeagues,
    toLeagueTables : pathToLeagueTable,
    toFixtures : pathToFixtures,
    extension : extension
};

/*
The exported utility functions.
 */
module.exports.utils = {
    formatName : function(name){ 
        return uniformName(name);
    },
    toWriteContent : function(pathToWrite, filename, content){
        return tryWrite(pathToWrite, filename, content);
    }
};

/**
 * Ctor function. It helps maintaining state, obviously.
 * 
 * @param {String} outputByUser File system path where to write the resultant files.
 */
function Writer(outputByUser, toBootstrapOption){
    this.outputPath = outputByUser;

    this.toBoot = toBootstrapOption;

    if (toBootstrapOption){
        pagemaker = require('./web_stuff/pagemaker_bootstraped.js');
    }else pagemaker = require('./web_stuff/pagemaker');

    this.teams = designTeamDetails;
    this.fixtures = designFixtures;
    this.leagueTable = designLeagueTable;
    this.players = designPlayersList;

    this.createIndexPage = createIndexPage;
    this.createLeaguesPage = createLeaguesPage;

    this.createAssetsDir = function(){
        let assetPath = require('./web_stuff/pagemaker').assetsDir;
        let newPath = path.join(this.outputPath, assetPath);

        if (this.toBoot){
            let bootstrapCssFileName = require('./web_stuff/pagemaker_bootstraped').bootstrapStyleSheet;
            copyAux(assetPath, newPath, bootstrapCssFileName);
        }else{
            let cssFileName = require('./web_stuff/pagemaker').mainStyleSheet;
            copyAux(assetPath, newPath, cssFileName);
        }

        function copyAux(assetPath, newPath,cssFileName){
            prepareCopy(assetPath, newPath, cssFileName, (initLocation, finalLocation) => {
                fs.createReadStream(initLocation).pipe(fs.createWriteStream(finalLocation));
            });
        }
    }
}

/**
 * We copy the file present in our root directory if the new place already exists. 
 * Otherwise we have to create everything before performing the copy.
 */
function prepareCopy(assetPath, newPath, cssFileName, callback){
    let initialLocation = path.join(assetPath, cssFileName);
    let finalLocation = path.join(newPath,cssFileName);
    fs.stat(newPath, (err)=>{
        if (err){
            fs.mkdir(newPath, (err) => {
                if(err) 
                    console.log("Cannot create assets dir.");
                else 
                    callback(initialLocation, finalLocation);
            });
        }else callback(initialLocation, finalLocation);
    });
}


function designTeamDetails(respectiveLeague, teamsObj){
    let rootDir = path.join(this.outputPath + pathToTeams);

    teamsObj.teams.forEach((team) => {
        let singleTeamPage = pagemaker.buildTeamPage(respectiveLeague.caption, team);
        let resourceName = uniformName(team.name);
        tryWrite(rootDir, resourceName, singleTeamPage);
    });
}

function designFixtures(respectiveLeague, fixturesObj){
    let content = pagemaker.buildLeagueFixtures(respectiveLeague, fixturesObj.fixtures);
    let dir = path.join(this.outputPath + pathToFixtures);
    tryWrite(dir, respectiveLeague.league, content);
}

function designLeagueTable(respectiveLeague, leagueTableObj){

    let content = pagemaker.buildLeagueTable(leagueTableObj);
    let dir = path.join(this.outputPath + pathToLeagueTable);
    tryWrite(dir, respectiveLeague.league, content);
}


function designPlayersList(respectiveClub, allPlayers){
    let content = pagemaker.buildPlayersPage(respectiveClub, allPlayers);
    let dir = path.join(this.outputPath + pathToPlayers);
    let name = uniformName(respectiveClub.name + 'Players');
    tryWrite(dir, name, content);
}


/**
 * Creates a single html page for each of the selected leagues
 * according to the parameters of the option '-leagues'.
 *
 * @param  {Array} selectedLeagues An array that contains leagues.
 */
function createLeaguesPage(selectedLeagues) {
    selectedLeagues.forEach((eachSelectedLeague) => {
        //ask for content based upon the given information
        let content = pagemaker.buildLeaguesPage(eachSelectedLeague);
        //join directories
        let finalPath = path.join(this.outputPath, pathToLeagues);
        //ask to write the html content in "finalPath/nameOfLeague"
        tryWrite(finalPath, eachSelectedLeague.league, content);
    });
}

/**
 * Creates the index page at the root directory. This file contains hyperlinks
 * according to the leagues passed as parameter to the application.
 *
 * @param  {Array} selectedLeagues Filtered leagues
 */
function createIndexPage(selectedLeagues){
    let content = pagemaker.buildIndexPage(selectedLeagues);
    let indexPath = path.join(this.outputPath);
    tryWrite(indexPath, 'Index', content);
}



function tryWrite(pathToWrite, filename, content){
    let completePath = path.join(pathToWrite, filename) + extension;
    fs.stat(pathToWrite, (err) => {
        if(err){
            //not found, create it then
            //isto devia sair daqui, função já tá com muitas responsabilidades
            fs.mkdir(pathToWrite, (err2) => {
                if (err2 && err2.code != 'EEXIST'){
                    console.log("Error creating path for the html pages: " + pathToWrite);
                    console.log(err2.message);
                    return ; //something ???
                }
                writeRepresentation(completePath, content)
            });
        }else writeRepresentation(completePath, content);
    });

    /**
     * Writes the content into the file located at the path
     * given as parameter.
     * 
     * @param  {String || Path} completeFilePath File's location.
     * @param  {String}         content  The content to write into the file.        
     */
    function writeRepresentation(completeFilePath, content){
        fs.writeFile(completeFilePath, new Buffer(content), (err) => {
            if (err)
                console.log('There was a problem with writing data into file.');
        });
    }
}


/**
 * Given a name, it removes all the blackspaces.
 *
 * "Hamburg SV" => HamburgSV
 *
 * This was made because not every team has a 'code' property and in some cases
 * this property is not even available in certain branches of the api and since
 * we need to give names to the files we create this is our solution. 
 *
 * @param name Full length name
 * @returns {string} Abbreviation
 */
function uniformName(name){
    // '\s' matchs single white space character
    return (name != undefined ) ? name.replace(/\s/g, "") : "name";
}
