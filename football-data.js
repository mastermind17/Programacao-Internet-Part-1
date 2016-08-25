'use strict';

const inspect = require('util').inspect; //for debug purposes
const http = require('http'); //http communication layer
const url = require('url'); //this module parses the url strings

/**
 * Function that interprets the arguments, building and intance
 * of Command. The Command object will represent the object. 
 * @type {Function}
 */
const parseArguments = require('./lib/cmd_parser');

/**
 *  The exported function that gives access to a resource from a given uri.
 */
const requestResourceHandler = require('./lib/requests');

/**
 * Ctor of Writer
 */
const Writer = require('./lib/writer').writer;


/**
 * Api key
 */
const apikey = module.exports.apiKey = 'YOUR-API-KEY-SHOULD-GO-HERE';


/**
 * The uri that identifies the resource that contains all the seasons within the api.
 */
const allSeasonsUri = url.parse("http://api.football-data.org/alpha/soccerseasons");

/**
 * Ctor for Options
 */
const Options = require('./lib/requests').options;

/**
 * The callback to be used after the parsing of the command line.
 *
 * @param err
 *      Error instance
 *
 * @param commandResult
 *      The Command instance
 */
function afterCommandParse(err, commandResult) {
    if (err)
        commandResult.showUsage();
    else
        requestAllSoccerSeasons(commandResult, allSeasonsUri, mainHandler);
}

/**
 * It all starts with parsing the command line
 * The callback function is then invoked with the result of that action.
 */
parseArguments(process.argv, afterCommandParse);



/**
 * This function performs the main request to the API uri where we can get
 * a response that represents the available football seasons.
 *
 * @param  {URL} seasonsURI
 *      The main api uri
 *
 * @param  {Function} afterResponseCB
 *      The callback to be executed once the request has finished.
 *      The callback function takes the descriptor of "callback(err, command, seasons)"
 *      in which 'err' is an instance of Error and'command' is an instance of Command and
 *      'seasons' is an object that represents the resource that contains all the seasons present
 *      in the API.
 */
function requestAllSoccerSeasons(commandResult, seasonsURI, afterResponseCB) {
    let optionsHeaders = {
        'X-Auth-Token': apikey
    };

    let optionsObj = new Options(seasonsURI.protocol, seasonsURI.hostname,
        null, null, seasonsURI.pathname, optionsHeaders);

    http.request(optionsObj, (res) => {
        res.setEncoding('utf8');
        let chunks = [];

        //concat as long as it arrives
        res.on("data", (chunk) => chunks.push(chunk));

        //callback must know what to do with the error
        res.on('error', (err) => {
            if (err) {
                afterResponseCB(err);
            }
        });
        //callback invoked with the result
        res.on("end", () => {
            let allSeasons = JSON.parse(chunks.join(" "));
            afterResponseCB(null, commandResult, allSeasons);
        });
    }).end();
}


/**
 * The callback used to handle the response that contains all seasons.
 * It acts as our application's backbone.
 *
 * Filters the array of leagues in order to send only the ones that matter
 * to the command's execution routine.
 *
 * It asks for the creation of the index page at the root level of the output directory
 * as well as the html page that points to the selected leagues.
 *
 * At the end the output is generated if there was an option in the command sent to the application.
 *
 * @param  {object} allSeasonsObj Object that represents the response in json format.
 */
function mainHandler(err, commandResult, allSeasonsObj) {
    //deal with the error in case is active
    if (err) {
        console.log("It was not possible to obtain all seasons from the server.");
        return;
    }

    //filter only some leagues, the ones we are interested in.
    let selectedLeagues = commandResult.getSelectedLeagues(allSeasonsObj);

    let writer = new Writer(commandResult.getExternalPath(), commandResult.getBootstrapOption());
    // creates an index html page
    writer.createIndexPage(selectedLeagues);
    //create an html page for each of the selected leagues
    writer.createLeaguesPage(selectedLeagues);

    //if has something to generate, execute command
    if (commandResult.hasGenerateOptions())
        commandResult.executeGenerateCommand(selectedLeagues, writer, requestResourceHandler);
}
