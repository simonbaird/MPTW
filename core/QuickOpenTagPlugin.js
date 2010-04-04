/***
|Name:|QuickOpenTagPlugin|
|Description:|Changes tag links to make it easier to open tags as tiddlers|
|Version:|3.0.1 ($Rev: 3861 $)|
|Date:|$Date: 2008-03-08 10:53:09 +1000 (Sat, 08 Mar 2008) $|
|Source:|http://mptw.tiddlyspot.com/#QuickOpenTagPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
***/
//{{{
config.quickOpenTag = {

	dropdownChar: (document.all ? "\u25bc" : "\u25be"), // the little one doesn't work in IE?

	createTagButton: function(place,tag,excludeTiddler) {
		// little hack so we can do this: <<tag PrettyTagName|RealTagName>>
		var splitTag = tag.split("|");
		var pretty = tag;
		if (splitTag.length == 2) {
			tag = splitTag[1];
			pretty = splitTag[0];
		}
		
		var sp = createTiddlyElement(place,"span",null,"quickopentag");
		createTiddlyText(createTiddlyLink(sp,tag,false),pretty);
		
		var theTag = createTiddlyButton(sp,config.quickOpenTag.dropdownChar,
                        config.views.wikified.tag.tooltip.format([tag]),onClickTag);
		theTag.setAttribute("tag",tag);
		if (excludeTiddler)
			theTag.setAttribute("tiddler",excludeTiddler);
    		return(theTag);
	},

	miniTagHandler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var tagged = store.getTaggedTiddlers(tiddler.title);
		if (tagged.length > 0) {
			var theTag = createTiddlyButton(place,config.quickOpenTag.dropdownChar,
                        	config.views.wikified.tag.tooltip.format([tiddler.title]),onClickTag);
			theTag.setAttribute("tag",tiddler.title);
			theTag.className = "miniTag";
		}
	},

	allTagsHandler: function(place,macroName,params) {
		var tags = store.getTags(params[0]);
		var filter = params[1]; // new feature
		var ul = createTiddlyElement(place,"ul");
		if(tags.length == 0)
			createTiddlyElement(ul,"li",null,"listTitle",this.noTags);
		for(var t=0; t<tags.length; t++) {
			var title = tags[t][0];
			if (!filter || (title.match(new RegExp('^'+filter)))) {
				var info = getTiddlyLinkInfo(title);
				var theListItem =createTiddlyElement(ul,"li");
				var theLink = createTiddlyLink(theListItem,tags[t][0],true);
				var theCount = " (" + tags[t][1] + ")";
				theLink.appendChild(document.createTextNode(theCount));
				var theDropDownBtn = createTiddlyButton(theListItem," " +
					config.quickOpenTag.dropdownChar,this.tooltip.format([tags[t][0]]),onClickTag);
				theDropDownBtn.setAttribute("tag",tags[t][0]);
			}
		}
	},

	// todo fix these up a bit
	styles: [
"/*{{{*/",
"/* created by QuickOpenTagPlugin */",
".tagglyTagged .quickopentag, .tagged .quickopentag ",
"	{ margin-right:1.2em; border:1px solid #eee; padding:2px; padding-right:0px; padding-left:1px; }",
".quickopentag .tiddlyLink { padding:2px; padding-left:3px; }",
".quickopentag a.button { padding:1px; padding-left:2px; padding-right:2px;}",
"/* extra specificity to make it work right */",
"#displayArea .viewer .quickopentag a.button, ",
"#displayArea .viewer .quickopentag a.tiddyLink, ",
"#mainMenu .quickopentag a.tiddyLink, ",
"#mainMenu .quickopentag a.tiddyLink ",
"	{ border:0px solid black; }",
"#displayArea .viewer .quickopentag a.button, ",
"#mainMenu .quickopentag a.button ",
"	{ margin-left:0px; padding-left:2px; }",
"#displayArea .viewer .quickopentag a.tiddlyLink, ",
"#mainMenu .quickopentag a.tiddlyLink ",
"	{ margin-right:0px; padding-right:0px; padding-left:0px; margin-left:0px; }",
"a.miniTag {font-size:150%;} ",
"#mainMenu .quickopentag a.button ",
"	/* looks better in right justified main menus */",
"	{ margin-left:0px; padding-left:2px; margin-right:0px; padding-right:0px; }", 
"#topMenu .quickopentag { padding:0px; margin:0px; border:0px; }",
"#topMenu .quickopentag .tiddlyLink { padding-right:1px; margin-right:0px; }",
"#topMenu .quickopentag .button { padding-left:1px; margin-left:0px; border:0px; }",
"/*}}}*/",
		""].join("\n"),

	init: function() {
		// we fully replace these builtins. can't hijack them easily
		window.createTagButton = this.createTagButton;
		config.macros.allTags.handler = this.allTagsHandler;
		config.macros.miniTag = { handler: this.miniTagHandler };
		config.shadowTiddlers["QuickOpenTagStyles"] = this.styles;
		store.addNotification("QuickOpenTagStyles",refreshStyles);
	}
}

config.quickOpenTag.init();

//}}}

