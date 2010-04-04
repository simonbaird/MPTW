/***
|Name:|SelectThemePlugin|
|Description:|Lets you easily switch theme and palette|
|Version:|1.0.1 ($Rev: 3646 $)|
|Date:|$Date: 2008-02-27 02:34:38 +1000 (Wed, 27 Feb 2008) $|
|Source:|http://mptw.tiddlyspot.com/#SelectThemePlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
!Notes
* Borrows largely from ThemeSwitcherPlugin by Martin Budden http://www.martinswiki.com/#ThemeSwitcherPlugin
* Theme is cookie based. But set a default by setting config.options.txtTheme in MptwConfigPlugin (for example)
* Palette is not cookie based. It actually overwrites your ColorPalette tiddler when you select a palette, so beware. 
!Usage
* {{{<<selectTheme>>}}} makes a dropdown selector
* {{{<<selectPalette>>}}} makes a dropdown selector
* {{{<<applyTheme>>}}} applies the current tiddler as a theme
* {{{<<applyPalette>>}}} applies the current tiddler as a palette
* {{{<<applyTheme TiddlerName>>}}} applies TiddlerName as a theme
* {{{<<applyPalette TiddlerName>>}}} applies TiddlerName as a palette
***/
//{{{

config.macros.selectTheme = {
	label: {
		selectTheme:"select theme",
		selectPalette:"select palette"
	},
	prompt: {
		selectTheme:"Select the current theme",
		selectPalette:"Select the current palette"
	},
	tags: {
		selectTheme:'systemTheme',
		selectPalette:'systemPalette'
	}
};

config.macros.selectTheme.handler = function(place,macroName)
{
	var btn = createTiddlyButton(place,this.label[macroName],this.prompt[macroName],this.onClick);
	// want to handle palettes and themes with same code. use mode attribute to distinguish
	btn.setAttribute('mode',macroName);
};

config.macros.selectTheme.onClick = function(ev)
{
	var e = ev ? ev : window.event;
	var popup = Popup.create(this);
	var mode = this.getAttribute('mode');
	var tiddlers = store.getTaggedTiddlers(config.macros.selectTheme.tags[mode]);
	// for default
	if (mode == "selectPalette") {
		var btn = createTiddlyButton(createTiddlyElement(popup,'li'),"(default)","default color palette",config.macros.selectTheme.onClickTheme);
		btn.setAttribute('theme',"(default)");
		btn.setAttribute('mode',mode);
	}
	for(var i=0; i<tiddlers.length; i++) {
		var t = tiddlers[i].title;
		var name = store.getTiddlerSlice(t,'Name');
		var desc = store.getTiddlerSlice(t,'Description');
		var btn = createTiddlyButton(createTiddlyElement(popup,'li'), name?name:t, desc?desc:config.macros.selectTheme.label['mode'], config.macros.selectTheme.onClickTheme);
		btn.setAttribute('theme',t);
		btn.setAttribute('mode',mode);
	}
	Popup.show();
	return stopEvent(e);
};

config.macros.selectTheme.onClickTheme = function(ev)
{
	var mode = this.getAttribute('mode');
	var theme = this.getAttribute('theme');
	if (mode == 'selectTheme')
		story.switchTheme(theme);
	else // selectPalette
		config.macros.selectTheme.updatePalette(theme);
	return false;
};

config.macros.selectTheme.updatePalette = function(title)
{
	if (title != "") {
		store.deleteTiddler("ColorPalette");
		if (title != "(default)")
			store.saveTiddler("ColorPalette","ColorPalette",store.getTiddlerText(title),
					config.options.txtUserName,undefined,"");
		refreshAll();
		if(config.options.chkAutoSave)
			saveChanges(true);
	}
};

config.macros.applyTheme = {
	label: "apply",
	prompt: "apply this theme or palette" // i'm lazy
};

config.macros.applyTheme.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var useTiddler = params[0] ? params[0] : tiddler.title;
	var btn = createTiddlyButton(place,this.label,this.prompt,config.macros.selectTheme.onClickTheme);
	btn.setAttribute('theme',useTiddler);
	btn.setAttribute('mode',macroName=="applyTheme"?"selectTheme":"selectPalette"); // a bit untidy here
}

config.macros.selectPalette = config.macros.selectTheme;
config.macros.applyPalette = config.macros.applyTheme;

config.macros.refreshAll = { handler: function(place,macroName,params,wikifier,paramString,tiddler) {
	createTiddlyButton(place,"refresh","refresh layout and styles",function() { refreshAll(); });
}};

//}}}

