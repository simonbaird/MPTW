/***
|Name:|SaveCloseTiddlerPlugin|
|Description:|Provides two extra toolbar commands, saveCloseTiddler and cancelCloseTiddler|
|Version:|3.0a|
|Date:|27-Jun-2011|
|Source:|http://mptw.tiddlyspot.com/#SaveCloseTiddlerPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
To use these add them to the commands in ToolbarCommands under EditToolbar,
or in the MptwTheme tiddler under EditTemplate.
***/
//{{{
merge(config.commands,{

  saveCloseTiddler: {
    text: 'done/close',
    tooltip: 'Save changes to this tiddler and close it',
    handler: function(ev,src,title) {
      var closeTitle = title;
      var newTitle = story.saveTiddler(title,ev.shiftKey);
      if (newTitle)
        closeTitle = newTitle;
      return config.commands.closeTiddler.handler(ev,src,closeTitle);
    }
  },

  cancelCloseTiddler: {
    text: 'cancel/close',
    tooltip: 'Undo changes to this tiddler and close it',
    handler: function(ev,src,title) {
      // the same as closeTiddler now actually
      return config.commands.closeTiddler.handler(ev,src,title);
    }
  }

});

//}}}
