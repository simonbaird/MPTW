/***
|Name:|InstantTimestampPlugin|
|Description:|A handy way to insert timestamps in your tiddler content|
|Version:|1.0.10a|
|Date:|27-Jun-2011|
|Source:|http://mptw.tiddlyspot.com/#InstantTimestampPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
!!Usage
If you enter {ts} in your tiddler content (without the spaces) it will be replaced with a timestamp when you save the tiddler. Full list of formats:
* {ts} or {t} -> timestamp
* {ds} or {d} -> datestamp
* !ts or !t at start of line -> !!timestamp
* !ds or !d at start of line -> !!datestamp
(I added the extra ! since that's how I like it. Remove it from translations below if required)
!!Notes
* Change the timeFormat and dateFormat below to suit your preference.
* See also http://mptw2.tiddlyspot.com/#AutoCorrectPlugin
* You could invent other translations and add them to the translations array below.
***/
//{{{

config.InstantTimestamp = {

  // adjust to suit
  timeFormat: 'DD/0MM/YY 0hh:0mm',
  dateFormat: 'DD/0MM/YY',

  translations: [
    [/^!ts?$/img,  "'!!{{ts{'+now.formatString(config.InstantTimestamp.timeFormat)+'}}}'"],
    [/^!ds?$/img,  "'!!{{ds{'+now.formatString(config.InstantTimestamp.dateFormat)+'}}}'"],

    // thanks Adapted Cat
    [/\{ts?\}(?!\}\})/ig,"'{{ts{'+now.formatString(config.InstantTimestamp.timeFormat)+'}}}'"],
    [/\{ds?\}(?!\}\})/ig,"'{{ds{'+now.formatString(config.InstantTimestamp.dateFormat)+'}}}'"]

  ],

  excludeTags: [
    "noAutoCorrect",
    "noTimestamp",
    "html",
    "CSS",
    "css",
    "systemConfig",
    "systemConfigDisabled",
    "zsystemConfig",
    "Plugins",
    "Plugin",
    "plugins",
    "plugin",
    "javascript",
    "code",
    "systemTheme",
    "systemPalette"
  ],

  excludeTiddlers: [
    "StyleSheet",
    "StyleSheetLayout",
    "StyleSheetColors",
    "StyleSheetPrint"
    // more?
  ]

};

TiddlyWiki.prototype.saveTiddler_mptw_instanttimestamp = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created) {

  tags = tags ? tags : []; // just in case tags is null
  tags = (typeof(tags) == "string") ? tags.readBracketedList() : tags;
  var conf = config.InstantTimestamp;

  if ( !!newBody && !tags.containsAny(conf.excludeTags) && !conf.excludeTiddlers.contains(newTitle) ) {

    var now = new Date();
    var trans = conf.translations;
    for (var i=0;i<trans.length;i++) {
      newBody = newBody.replace(trans[i][0], eval(trans[i][1]));
    }
  }

  // TODO: use apply() instead of naming all args?
  return this.saveTiddler_mptw_instanttimestamp(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created);
}

// you can override these in StyleSheet
setStylesheet(".ts,.ds { font-style:italic; }","instantTimestampStyles");

//}}}
