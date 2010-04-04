/***
|Name:|SaveCloseTiddlerPlugin|
|Description:|Provides two extra toolbar commands, saveCloseTiddler and cancelCloseTiddler|
|Version:|3.0 ($Rev: 5502 $)|
|Date:|$Date: 2008-06-10 23:31:39 +1000 (Tue, 10 Jun 2008) $|
|Source:|http://mptw.tiddlyspot.com/#SaveCloseTiddlerPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
To use these you must add them to the tool bar in your EditTemplate
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

