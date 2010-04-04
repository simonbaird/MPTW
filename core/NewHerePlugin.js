/***
|Name:|NewHerePlugin|
|Description:|Creates the new here and new journal macros|
|Version:|3.0 ($Rev: 3861 $)|
|Date:|$Date: 2008-03-08 10:53:09 +1000 (Sat, 08 Mar 2008) $|
|Source:|http://mptw.tiddlyspot.com/#NewHerePlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License|http://mptw.tiddlyspot.com/#TheBSDLicense|
***/
//{{{
merge(config.macros, {
	newHere: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			wikify("<<newTiddler "+paramString+" tag:[["+tiddler.title+"]]>>",place,null,tiddler);
		}
	},
	newJournalHere: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			wikify("<<newJournal "+paramString+" tag:[["+tiddler.title+"]]>>",place,null,tiddler);
		}
	}
});

//}}}

