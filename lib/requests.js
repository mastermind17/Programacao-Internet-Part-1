'use strict';
const http = require('http');
const inspect = require('util').inspect;
const url = require('url');



module.exports = requestResourceFromLeagues;

module.exports.options =  Options;

/**
 * Sends an HTTP request in order to obtain the resource specified by the
 * 'option' parameter.
 * The callback is suppose to be called in order to represent the resource visually inside
 * some file.
 *
 * URI do genero:
 *     http://api.football-data.org/alpha/soccerseasons/402/teams
 * em que "402" é uma liga.
 *
 * @param {Array} leaguesSelected Selected leagues according to the parameters.
 * @param {String} option Specifies the resource to look for.
 * @param {Function} writerInstance The object which callback specified with'option' will create the resource's page.
 */
function requestResourceFromLeagues(leaguesSelected, option, writerInstance) {
    leaguesSelected.forEach((league) => {
        if (option === 'players'){
            requestComplexOptions(league, findPlayersCb, writerInstance)
        }else{
            requestSimpleOptions(league, option, writerInstance);
        }
    });
}

/*
  assumes option is 'players' and if the accepted set of options changes in the
  future this implementation will have to change as well or whoever calls this
  function must be aware of this assumption
*/
function requestComplexOptions(league, callback, writerInstance){
    //need to go to the teams first
    let uri = league._links['teams'].href.replace(' ', '');
    let options = parseSimpleRequestUri(uri);
    http.request(options, function(res){
            res.setEncoding('utf8');
            let chunks = [];
            res.on("data", (chunk) => chunks.push(chunk));

            //res.on('error')

            res.on('end', () => {
                let availableResource = JSON.parse(chunks.join(" "));
                callback(availableResource, writerInstance);
            });
        }).end();
}

function findPlayersCb(resource, writerInstance){
    resource.teams.forEach((team) => {
        //não percebemos porque vinha com espaços
        let options = parseSimpleRequestUri(team._links.players.href)
        http.request(options, function(res){
            res.setEncoding('utf8');
            let chunks = [];
            res.on("data", (chunk) => chunks.push(chunk));


            res.on('end', () => {
                let availableResource = JSON.parse(chunks.join(" "));
                writerInstance['players'](team, availableResource);
            });
        }).end();
    });
}

/**
 * The function that handles the most simple options that are passed
 * to the 'generate' command. We call it "simple" because these are available
 * directly from the json response. By "available" we mean we can get the direct
 * uri straight from the json response. 
 * @param  {[type]} league
 *          An object that represents a league specified as it is in the API.
 * @param  {[type]} option
 *          An instance of Option
 * @param  {[type]} writerInstance
 *
 */
function requestSimpleOptions(league, option, writerInstance){
    let options = parseSimpleRequestUri(league._links[option].href.replace(" ", ""));
    http.request(options, function(res){
        res.setEncoding('utf8');
        let chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        //error event
        res.on('end', () => {
            //por exemplo, todas as equipas de uma liga
            try{
                let availableResource = JSON.parse(chunks.join(" "));
                writerInstance[option](league, availableResource); //faz com que a função seja de instancia
            }catch (Error){
                console.log("Bad parsing")
            }
        });
    }).end();
}


/**
 * Ctor Function that creates an object to be used with the method
 * request.
 *
 * @param protocol: Protocol to use. Defaults to 'http'.
 * @param hostname: Alias for host. To support url.parse() hostname is preferred.
 * @param port: Port of remote server. Defaults to 80.
 * @param method: A string specifying the HTTP request method. Defaults to 'GET'.
 * @param path: Request path. Defaults to '/'. Should include query string if any.
 * @param headers: An object containing request headers.
 */
//TODO mover 'hostname' para primeiro argumento
function Options(protocol, hostname, port, method, path, headers){
    this.protocol = protocol || 'http';
    this.hostname = hostname;
    this.port = port || 80;
    this.method = method || 'GET';
    this.path = path || '/';
    this.headers = headers;
}


function parseSimpleRequestUri(uri){
    let parsedUrl = url.parse(uri.replace(' ', ''));
    let apikey = require('../football-data').apiKey;
    let optionsHeaders = { 'X-Auth-Token': apikey };
    return new Options(parsedUrl.protocol, parsedUrl.hostname, null, null, 
                                            parsedUrl.path, optionsHeaders);
}
