/***
|Name:|HideWhenPlugin|
|Description:|Allows conditional inclusion/exclusion in templates|
|Version:|3.1 ($Rev: 3919 $)|
|Date:|$Date: 2008-03-13 02:03:12 +1000 (Thu, 13 Mar 2008) $|
|Source:|http://mptw.tiddlyspot.com/#HideWhenPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
For use in ViewTemplate and EditTemplate. Example usage:
{{{<div macro="showWhenTagged Task">[[TaskToolbar]]</div>}}}
{{{<div macro="showWhen tiddler.modifier == 'BartSimpson'"><img src="bart.gif"/></div>}}}
***/
//{{{

window.hideWhenLastTest = false;

window.removeElementWhen = function(test,place) {
	window.hideWhenLastTest = test;
	if (test) {
		removeChildren(place);
		place.parentNode.removeChild(place);
	}
};


merge(config.macros,{

	hideWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( eval(paramString), place);
	}},

	showWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !eval(paramString), place);
	}},

	hideWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( tiddler.tags.containsAll(params), place);
	}},

	showWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !tiddler.tags.containsAll(params), place);
	}},

	hideWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( tiddler.tags.containsAny(params), place);
	}},

	showWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !tiddler.tags.containsAny(params), place);
	}},

	hideWhenTaggedAll: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( tiddler.tags.containsAll(params), place);
	}},

	showWhenTaggedAll: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !tiddler.tags.containsAll(params), place);
	}},

	hideWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0]), place);
	}},

	showWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !(store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0])), place);
	}},

	hideWhenTitleIs: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( tiddler.title == params[0], place);
	}},

	showWhenTitleIs: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( tiddler.title != params[0], place);
	}},

	'else': { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		removeElementWhen( !window.hideWhenLastTest, place);
	}}

});

//}}}

