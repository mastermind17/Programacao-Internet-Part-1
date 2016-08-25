'use strict';
module.exports = CommandResult;


/**
 * The user can specify a different output directory by passing
 * the option '-file' with the new directory in front of it.
 *
 * When nothing is said about that option this is the default value.
 */
const generalOutputDir = './output/';

/**
 * The object that represents the command
 * according to the parameters given to the application.
 *
 * It gets populated after calling the "parse" method.
 */
function CommandResult(){
  this.outputPath = generalOutputDir;
  this.toBootstrap = false;
}

 /**
 * This function represents the command that executes
 * when the option "-usage" is used.
 * It makes use of an object defined in the local scope
 * that contains all the options accepted by the program
 * as properties and what they mean associated to them as well.
 */
CommandResult.prototype.showUsage = function() {

  let info = 'Football Data HTML Generator\n';
  info += 'Usage: node football-data.js <options>\n';
  info += 'Where options include:';
  console.log(info);
    
  let usage = {
    "usage": "Shows the application usage.",
    "file": "<file-path> Reads all arguments from the text file in <file-path>.",
    "leagues": "<leagues-list> A comma separated list of the league names or its short names (e.g Primeira Liga, 2015/2016, PD)",
    "generate": "[teams|fixtures|leagueTable|players] What to generate. A comma separated list of the defined values.",
    "output": "<dir-path> Path to output directory where files are generated."
  };
  for (var prop in usage) console.log("\t-" + prop + " " + usage[prop]);
};


CommandResult.prototype.setLeagues = function(arrOfLeagueNames){
  this.leagues = arrOfLeagueNames; //array[index + 1].split(",");
};

CommandResult.prototype.setGenerateOptions = function(arrOfGenerateOptions){
  this.generateOptions = arrOfGenerateOptions; //array[index + 1].split(",");
};

CommandResult.prototype.setExternalOutputPath = function(externalPath){
  this.outputPath = externalPath;
};

CommandResult.prototype.getExternalPath = function(){
  return this.outputPath;
};

CommandResult.prototype.activateBootstrap = function(){
  this.toBootstrap = true;
};

CommandResult.prototype.hasGenerateOptions = function(){
  return this.generateOptions != undefined
};

CommandResult.prototype.getSelectedLeagues = function(allSeasons){
  let wantedLeagues = this.leagues;
  return filterLeagues(allSeasons, wantedLeagues);
};

CommandResult.prototype.getBootstrapOption = function(){
  return this.toBootstrap;
};


/**
 * Traverses the parameters given to the option '-generate'
 * and emits an intent to obtain those resources.
 *
 * We delegate the intent handling to the Request module.
 * It also expects an instance of Writer with the given output path.
 * This instance knows how to represent every resource obtained by the Request module.
 * If the request is successful the callback from the writer
 * module will be invoked and will represent that same resource.
 *
 * @param  {Array} selectedLeagues
 *        The selected leagues according to the parameters
 *
 * @param {Object} instanceOfWriter
 *        An instance of Writer. This is the entity that knows how to represent the resource visually.
 *
 * @param {Function} toObtainResourceCallback
 *        Callback function that has the descriptor of '(leaguesSelected, option, writerInstance)'  in
 *        which the 'leaguesSelected' is an array that contains only the filtered leagues and 'option' is
 *        the indication of what needs to be represented and 'instanceOfWriter' is an instance of Writer
 *        that will represent the resource according to the option.
 */
CommandResult.prototype.executeGenerateCommand = function(selectedLeagues, instanceOfWriter, toObtainResourceCallback){

  this.generateOptions.forEach((option) => {
    toObtainResourceCallback(selectedLeagues, option, instanceOfWriter);
  });

  //nao encontrei melhor sitio para fazer isto
  //copy assets
  instanceOfWriter.createAssetsDir();
};


  /**
   * Returns an array with the leagues that correspond to the
   * names given as parameters to the option '-leagues'.
   *
   * @param soccerSeasons
   *        All the soccer seasons
   *
   * @param namesOfLeagues
   *        Cmd line options
   *
   * @returns {Array} Leagues that are referenced in the cmd line options
   */
  function filterLeagues(soccerSeasons, namesOfLeagues) {
    let selectedLeagues = [];
    namesOfLeagues.forEach((leagueName) => {
      let filter = searchLeague(soccerSeasons, leagueName.trim());
      if (filter != null) //maintain an empty array otherwise
        selectedLeagues.push(filter);
    });
    return selectedLeagues;
  }

  /**
   * Given an name of a league, extract it from the set of soccer seasons.
   *
   * @param soccerSeasons The object that represents a soccer season
   * @param nameOrShortName The name of the league to extract
   *
   * @nullable
   */
  function searchLeague(soccerSeasons, nameOrShortName) {
    for (let season of soccerSeasons)
      if (season.caption == nameOrShortName || season.league == nameOrShortName)
        return season;
    return null;
  }
