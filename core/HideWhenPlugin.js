/***
|Name:|HideWhenPlugin|
|Description:|Allows conditional inclusion/exclusion in templates|
|Version:|3.2a|
|Date:|27-Jun-2011|
|Source:|http://mptw.tiddlyspot.com/#HideWhenPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
For use in ViewTemplate and EditTemplate. Example usage:
{{{<div macro="showWhenTagged Task">[[TaskToolbar]]</div>}}}
{{{<div macro="showWhen tiddler.modifier == 'BartSimpson'"><img src="bart.gif"/></div>}}}

Warning: the showWhen and hideWhen macros will blindly eval paramString.
This could be used to execute harmful javascript from a tiddler.

(TODO: Make some effort to sanitize paramString. Perhaps disallow the equals sign?)
***/
//{{{

window.hideWhenLastTest = false;

window.removeElementWhen = function(test,place) {
  window.hideWhenLastTest = test;
  if (test) {
    jQuery(place).empty()
    place.parentNode.removeChild(place);
  }
};

merge(config.macros,{

  hideWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( eval(paramString), place );
  }},

  showWhen: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( !eval(paramString), place );
  }},

  hideWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( tiddler.tags.containsAll(params), place );
  }},

  showWhenTagged: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( !tiddler.tags.containsAll(params), place );
  }},

  hideWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( tiddler.tags.containsAny(params), place );
  }},

  showWhenTaggedAny: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( !tiddler.tags.containsAny(params), place );
  }},

  hideWhenTaggedAll: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( tiddler.tags.containsAll(params), place );
  }},

  showWhenTaggedAll: { handler: function (place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( !tiddler.tags.containsAll(params), place );
  }},

  hideWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0]), place );
  }},

  showWhenExists: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( !(store.tiddlerExists(params[0]) || store.isShadowTiddler(params[0])), place );
  }},

  hideWhenTitleIs: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( tiddler.title == params[0], place );
  }},

  showWhenTitleIs: { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( tiddler.title != params[0], place );
  }},

  'else': { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    removeElementWhen( !window.hideWhenLastTest, place );
  }}

});

//}}}
