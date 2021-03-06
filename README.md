# Football & Node.JS - Part 1

## Problem being solved:

We have a web service that show us the football results for a group of european football leagues. Lets take this api and build a command line application that shows specific results according to the given commands. The api I'm talking about is [football-data.org](http://api.football-data.org/). 

The application must be able to generate HTML files from commands given from the terminal or from a file with JSON notation. An example, also used inside unit tests, can be the file _"file_to_read.js"_. The program will generate a folder called _"output"_ where the generated files will reside. The file called _"index.html"_ will be the main HTML page. The _"assets"_ folder will have css files created by us as well as from [Bootstrap](http://getbootstrap.com/). The HTML files are generated by javascript code. We did not tried to emulate any kind of view engine. These will be used later in part 2 and 3.

You will need an api key in order to execute this application. Mine was removed before this source code was made public.

This application was made using the Node.Js framework and tries to demonstrate the usage of it. It had the amazing contribution of Pedro Gabriel.

## How did we solved it

This is how we structured our solution:

* football-data.js
* lib
    * cmd_parser.js
    * command.js
    * requests.js
    * writer.js
    * web_stuff
        * pagemaker.js
        * pagemaker_bootstrap.js
        * web_utils.js

The _football-data.js_ file represents the entry point of this application. If we execute the program like the following _"node football-data.js -leagues PD -generate leagueTable,teams"_ it will be generated the leaguetable for the spanish football league ("PD" stands for "Primera Division". This are names supported and documented by the web service this program is based upon.) in which every team of the leaguetable will have an hyperlink to the details of itself.

Let me show some images after the execution:

**The leaguetable:**

![Trab_1_LeagueTable_NoStrap](http://i.imgur.com/TFgYrZD.png)

and when you click over the "Barcelona" team name 

**Details of a certain team:**

![Trab_1_details_team_NoStrap](http://i.imgur.com/0rvafDa.png)

After sending the command, all the arguments will be parsed in order for the application to understand what needs to do. From this parsing will result an instance of CommandResult. This instance is created by using the "constructor function" provided by the file _"Command.js"_. This instance will have the information needed by the application in order to execute all the parts of a certain command. 

The next step is to request all the football leagues from the main endpoint given by the API - _"http://api.football-data.org/alpha/soccerseasons"_. If the response is successful the program will examine all the parts of the command.

The final results - HTML files - are made by the module _"writer.js"_ in conjuntion with the files inside "**web_stuff**". This files generate the HTML. 

The program also supports the option _"-bootstrap"_ which will make the html files use the css file made by the bootstrap library instead of using the one made by us.

## How to use

node football-data.js _**options**_

Where _"options"_ include:
   * _**-usage**_ Shows the application usage
   * _**-file <file-path>**_ Reads all arguments from the text file in <file-path>
   * _**-leagues <leagues-list>**_ A comma separated list of the league names or its short names (e.g Primeira Liga, 2015/2016, PD)
   * _**-generate [teams|fixtures|leagueTable|players]**_ What to generate. A comma separated list of the defined values.
   * _**-output <dir-path>**_ Path to output directory where files are generated.

Inside the root directory type in your favorite terminal:

`npm install` //install dependencies

`node football-data.js -leagues PD -generate leagueTable,teams` //something like this
