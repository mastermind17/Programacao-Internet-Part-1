'use strict';
/*
Node internal modules
 */
const fs = require('fs');
const path = require('path');



/**
 * The exported object that contains properties that help build the html pages
 */
const pagemaker = require('./web_stuff/pagemaker');


/**
 * Ctor function of Command
 */
const Command = require('./command');


/**
 * Main exported function is the main routine that eventually will
 * populate an instance of CommandResult with the various options
 * supplied via the array 'argv'.
 * The callback function takes the descriptor of "callback(err, command)"
 * in which 'err' is an instance of Error and 'command' is an instance of Command.
 */
module.exports = function(args, callback){
    return parse(args, callback);
};




/**
 * Execuções sem opções (argv.length <= 2) retornam TRUE.
 */
function checkLength(args) {
    return args.length <= 2
}

/**
 * Main block before parsing all the parameters. It decides between
 * parsing the parameters from a file or straight from the argv array.
 *
 * @param args
 *      Arguments from the command line.
 *
 * @param afterParsingCallback
 *      Callback to be invoked. It takes the descriptor of "callback(err, command)"
 *      in which 'err' is an instance of Error and 'command' is an instance of Command.
 */
function parse(args, afterParsingCallback) {

    //not enough arguments
    if (checkLength(args)){ //|| validateArguments(args)) {
        afterParsingCallback(new Error('Not enough/valid arguments'), new Command());
        return;
    }

    //enough to parse but we need to be careful about the '-file' option
    if (args.indexOf('-file') > -1) { //aka 'contains' in JS
        fs.stat(args[args.length - 1], (err) => {
            if (err) {
                prepareAndInvokeCb(new Error("Couldn't find the specified file."));
            }
            else {
                // read arguments from file
                let filePath = args[args.indexOf('-file') + 1];
                fs.readFile(filePath, function (err2, data) {
                    if (err2){
                        let error = new Error("Couldn't open the specified file. Perhaps you don't have the rights.");
                        prepareAndInvokeCb(error);
                    }
                    prepareAndInvokeCb(null, jsonToArray(JSON.parse(data)), afterParsingCallback);
                });
            }
        });
    }
    else {
        prepareAndInvokeCb(null , args, afterParsingCallback);
    }
}

/**
 * If we make sure the arguments are given through an array, we can
 * reuse the routine "parseArrayOfArguments" despite them coming from
 * some file or straight from the command line.
 * 
 * @param args Arguments array.
 * @param afterCommandsParseCb Callback to invoke with the command instance as result.
 */
function prepareAndInvokeCb(err, args, afterCommandsParseCb){
    if (err){
        console.log(err.message);
        return;
    }
    let command = parseArrayOfArguments(args);
    afterCommandsParseCb(null, command); //there is no error so we send null
}

/**
 * Given an object, its properties and values are transformed into an array.
 * The array keeps the sequence of values just like they are defined in the object.
 *
 * @param jsonObj Object read from file with arguments.
 * @returns {Array} An array of arguments.
 */
function jsonToArray(jsonObj){
    let result = [];
    for(var prop in jsonObj){
        result.push(prop, jsonObj[prop]);
    }
    return result;
}


/**
 * Routine that tries to parse the parameters from the given array.
 *
 * @param args Arguments array.
 * @returns An object that represents the command to be executed.
 */
function parseArrayOfArguments(args) {
    let command = new Command();
    args.forEach(function(val, index, array) {
        switch (val) {
            case '-leagues':
                command.setLeagues(array[index + 1].split(","));
                break;
            case '-generate':
                command.setGenerateOptions(array[index + 1].split(","));
                break;
            case "-output":
                command.setExternalOutputPath(path.normalize(array[index + 1]));
                break;
            case '-bootstrap':
                command.activateBootstrap();
                break;
        }
    });
    return command;
}








