/***
|Name:|TagglyTaggingPlugin|
|Description:|tagglyTagging macro is a replacement for the builtin tagging macro in your ViewTemplate|
|Version:|3.3.1 ($Rev: 9828 $)|
|Date:|$Date: 2009-06-03 21:38:41 +1000 (Wed, 03 Jun 2009) $|
|Source:|http://mptw.tiddlyspot.com/#TagglyTaggingPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
!Notes
See http://mptw.tiddlyspot.com/#TagglyTagging
***/
//{{{

merge(String.prototype,{

	parseTagExpr: function(debug) {

		if (this.trim() == "")
			return "(true)";

		var anyLogicOp = /(!|&&|\|\||\(|\))/g;
		var singleLogicOp = /^(!|&&|\|\||\(|\))$/;

		var spaced = this.
			// because square brackets in templates are no good
			// this means you can use [(With Spaces)] instead of [[With Spaces]]
			replace(/\[\(/g," [[").
			replace(/\)\]/g,"]] "). 
			// space things out so we can use readBracketedList. tricky eh?
			replace(anyLogicOp," $1 ");

		var expr = "";

		var tokens = spaced.readBracketedList(false); // false means don't uniq the list. nice one JR!

		for (var i=0;i<tokens.length;i++)
			if (tokens[i].match(singleLogicOp))
				expr += tokens[i];
			else
				expr += "tiddler.tags.contains('%0')".format([tokens[i].replace(/'/,"\\'")]); // fix single quote bug. still have round bracket bug i think

		if (debug)
			alert(expr);

		return '('+expr+')';
	}

});

merge(TiddlyWiki.prototype,{
	getTiddlersByTagExpr: function(tagExpr,sortField) {

		var result = [];

		var expr = tagExpr.parseTagExpr();

		store.forEachTiddler(function(title,tiddler) {
			if (eval(expr))
				result.push(tiddler);
		});

		if(!sortField)
			sortField = "title";

		result.sort(function(a,b) {return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1);});
		
		return result;
	}
});

config.taggly = {

	// for translations
	lingo: {
		labels: {
			asc:        "\u2191", // down arrow
			desc:       "\u2193", // up arrow
			title:      "title",
			modified:   "modified",
			created:    "created",
			show:       "+",
			hide:       "-",
			normal:     "normal",
			group:      "group",
			commas:     "commas",
			sitemap:    "sitemap",
			numCols:    "cols\u00b1", // plus minus sign
			label:      "Tagged as '%0':",
			exprLabel:  "Matching tag expression '%0':",
			excerpts:   "excerpts",
			descr:      "descr",
			slices:     "slices",
			contents:   "contents",
			sliders:    "sliders",
			noexcerpts: "title only",
			noneFound:  "(none)"
		},

		tooltips: {
			title:      "Click to sort by title",
			modified:   "Click to sort by modified date",
			created:    "Click to sort by created date",
			show:       "Click to show tagging list",
			hide:       "Click to hide tagging list",
			normal:     "Click to show a normal ungrouped list",
			group:      "Click to show list grouped by tag",
			sitemap:    "Click to show a sitemap style list",
			commas:     "Click to show a comma separated list",
			numCols:    "Click to change number of columns",
			excerpts:   "Click to show excerpts",
			descr:      "Click to show the description slice",
			slices:     "Click to show all slices",
			contents:   "Click to show entire tiddler contents",
			sliders:    "Click to show tiddler contents in sliders",
			noexcerpts: "Click to show entire title only"
		},

		tooDeepMessage: "* //sitemap too deep...//"
	},

	config: {
		showTaggingCounts: true,
		listOpts: {
			// the first one will be the default
			sortBy:     ["title","modified","created"],
			sortOrder:  ["asc","desc"],
			hideState:  ["show","hide"],
			listMode:   ["normal","group","sitemap","commas"],
			numCols:    ["1","2","3","4","5","6"],
			excerpts:   ["noexcerpts","excerpts","descr","slices","contents","sliders"]
		},
		valuePrefix: "taggly.",
		excludeTags: ["excludeLists","excludeTagging"],
		excerptSize: 50,
		excerptMarker: "/%"+"%/",
		siteMapDepthLimit: 25
	},

	getTagglyOpt: function(title,opt) {
		var val = store.getValue(title,this.config.valuePrefix+opt);
		return val ? val : this.config.listOpts[opt][0];
	},

	setTagglyOpt: function(title,opt,value) {
		// create it silently if it doesn't exist
		if (!store.tiddlerExists(title)) {
			store.saveTiddler(title,title,config.views.editor.defaultText.format([title]),config.options.txtUserName,new Date(),"");

			// <<tagglyTagging expr:"...">> creates a tiddler to store its display settings
			// Make those tiddlers less noticeable by tagging as excludeSearch and excludeLists
			// Because we don't want to hide real tags, check that they aren't actually tags before doing so
			// Also tag them as tagglyExpression for manageability
			// (contributed by RA)
			if (!store.getTaggedTiddlers(title).length) {
				store.setTiddlerTag(title,true,"excludeSearch");
				store.setTiddlerTag(title,true,"excludeLists");
				store.setTiddlerTag(title,true,"tagglyExpression");
			}
		}

		// if value is default then remove it to save space
		return store.setValue(title, this.config.valuePrefix+opt, value == this.config.listOpts[opt][0] ? null : value);
	},

	getNextValue: function(title,opt) {
		var current = this.getTagglyOpt(title,opt);
		var pos = this.config.listOpts[opt].indexOf(current);
		// supposed to automagically don't let cols cycle up past the number of items
		// currently broken in some situations, eg when using an expression
		// lets fix it later when we rewrite for jquery
		// the columns thing should be jquery table manipulation probably
		var limit = (opt == "numCols" ? store.getTaggedTiddlers(title).length : this.config.listOpts[opt].length);
		var newPos = (pos + 1) % limit;
		return this.config.listOpts[opt][newPos];
	},

	toggleTagglyOpt: function(title,opt) {
		var newVal = this.getNextValue(title,opt);
		this.setTagglyOpt(title,opt,newVal);
	}, 

	createListControl: function(place,title,type) {
		var lingo = config.taggly.lingo;
		var label;
		var tooltip;
		var onclick;

		if ((type == "title" || type == "modified" || type == "created")) {
			// "special" controls. a little tricky. derived from sortOrder and sortBy
			label = lingo.labels[type];
			tooltip = lingo.tooltips[type];

			if (this.getTagglyOpt(title,"sortBy") == type) {
				label += lingo.labels[this.getTagglyOpt(title,"sortOrder")];
				onclick = function() {
					config.taggly.toggleTagglyOpt(title,"sortOrder");
					return false;
				}
			}
			else {
				onclick = function() {
					config.taggly.setTagglyOpt(title,"sortBy",type);
					config.taggly.setTagglyOpt(title,"sortOrder",config.taggly.config.listOpts.sortOrder[0]);
					return false;
				}
			}
		}
		else {
			// "regular" controls, nice and simple
			label = lingo.labels[type == "numCols" ? type : this.getNextValue(title,type)];
			tooltip = lingo.tooltips[type == "numCols" ? type : this.getNextValue(title,type)];
			onclick = function() {
				config.taggly.toggleTagglyOpt(title,type);
				return false;
			}
		}

		// hide button because commas don't have columns
		if (!(this.getTagglyOpt(title,"listMode") == "commas" && type == "numCols"))
			createTiddlyButton(place,label,tooltip,onclick,type == "hideState" ? "hidebutton" : "button");
	},

	makeColumns: function(orig,numCols) {
		var listSize = orig.length;
		var colSize = listSize/numCols;
		var remainder = listSize % numCols;

		var upperColsize = colSize;
		var lowerColsize = colSize;

		if (colSize != Math.floor(colSize)) {
			// it's not an exact fit so..
			upperColsize = Math.floor(colSize) + 1;
			lowerColsize = Math.floor(colSize);
		}

		var output = [];
		var c = 0;
		for (var j=0;j<numCols;j++) {
			var singleCol = [];
			var thisSize = j < remainder ? upperColsize : lowerColsize;
			for (var i=0;i<thisSize;i++) 
				singleCol.push(orig[c++]);
			output.push(singleCol);
		}

		return output;
	},

	drawTable: function(place,columns,theClass) {
		var newTable = createTiddlyElement(place,"table",null,theClass);
		var newTbody = createTiddlyElement(newTable,"tbody");
		var newTr = createTiddlyElement(newTbody,"tr");
		for (var j=0;j<columns.length;j++) {
			var colOutput = "";
			for (var i=0;i<columns[j].length;i++) 
				colOutput += columns[j][i];
			var newTd = createTiddlyElement(newTr,"td",null,"tagglyTagging"); // todo should not need this class
			wikify(colOutput,newTd);
		}
		return newTable;
	},

	createTagglyList: function(place,title,isTagExpr) {
		switch(this.getTagglyOpt(title,"listMode")) {
			case "group":  return this.createTagglyListGrouped(place,title,isTagExpr); break;
			case "normal": return this.createTagglyListNormal(place,title,false,isTagExpr); break;
			case "commas": return this.createTagglyListNormal(place,title,true,isTagExpr); break;
			case "sitemap":return this.createTagglyListSiteMap(place,title,isTagExpr); break;
		}
	},

	getTaggingCount: function(title,isTagExpr) {
		// thanks to Doug Edmunds
		if (this.config.showTaggingCounts) {
			var tagCount = config.taggly.getTiddlers(title,'title',isTagExpr).length;
			if (tagCount > 0)
				return " ("+tagCount+")";
		}
		return "";
	},

	getTiddlers: function(titleOrExpr,sortBy,isTagExpr) {
		return isTagExpr ? store.getTiddlersByTagExpr(titleOrExpr,sortBy) : store.getTaggedTiddlers(titleOrExpr,sortBy);
	},

	getExcerpt: function(inTiddlerTitle,title,indent) {
		if (!indent)
			indent = 1;

		var displayMode = this.getTagglyOpt(inTiddlerTitle,"excerpts");
		var t = store.getTiddler(title);

		if (t && displayMode == "excerpts") {
			var text = t.text.replace(/\n/," ");
			var marker = text.indexOf(this.config.excerptMarker);
			if (marker != -1) {
				return " {{excerpt{<nowiki>" + text.substr(0,marker) + "</nowiki>}}}";
			}
			else if (text.length < this.config.excerptSize) {
				return " {{excerpt{<nowiki>" + t.text + "</nowiki>}}}";
			}
			else {
				return " {{excerpt{<nowiki>" + t.text.substr(0,this.config.excerptSize) + "..." + "</nowiki>}}}";
			}
		}
		else if (t && displayMode == "contents") {
			return "\n{{contents indent"+indent+"{\n" + t.text + "\n}}}";
		}
		else if (t && displayMode == "sliders") {
			return "<slider slide>\n{{contents{\n" + t.text + "\n}}}\n</slider>";
		}
		else if (t && displayMode == "descr") {
			var descr = store.getTiddlerSlice(title,'Description');
			return descr ? " {{excerpt{" + descr  + "}}}" : "";
		}
		else if (t && displayMode == "slices") {
			var result = "";
			var slices = store.calcAllSlices(title);
			for (var s in slices)
				result += "|%0|<nowiki>%1</nowiki>|\n".format([s,slices[s]]);
			return result ? "\n{{excerpt excerptIndent{\n" + result  + "}}}" : "";
		}
		return "";
	},

	notHidden: function(t,inTiddler) {
		if (typeof t == "string") 
			t = store.getTiddler(t);
		return (!t || !t.tags.containsAny(this.config.excludeTags) ||
				(inTiddler && this.config.excludeTags.contains(inTiddler)));
	},

	// this is for normal and commas mode
	createTagglyListNormal: function(place,title,useCommas,isTagExpr) {

		var list = config.taggly.getTiddlers(title,this.getTagglyOpt(title,"sortBy"),isTagExpr);

		if (this.getTagglyOpt(title,"sortOrder") == "desc")
			list = list.reverse();

		var output = [];
		var first = true;
		for (var i=0;i<list.length;i++) {
			if (this.notHidden(list[i],title)) {
				var countString = this.getTaggingCount(list[i].title);
				var excerpt = this.getExcerpt(title,list[i].title);
				if (useCommas)
					output.push((first ? "" : ", ") + "[[" + list[i].title + "]]" + countString + excerpt);
				else
					output.push("*[[" + list[i].title + "]]" + countString + excerpt + "\n");

				first = false;
			}
		}

		return this.drawTable(place,
			this.makeColumns(output,useCommas ? 1 : parseInt(this.getTagglyOpt(title,"numCols"))),
			useCommas ? "commas" : "normal");
	},

	// this is for the "grouped" mode
	createTagglyListGrouped: function(place,title,isTagExpr) {
		var sortBy = this.getTagglyOpt(title,"sortBy");
		var sortOrder = this.getTagglyOpt(title,"sortOrder");

		var list = config.taggly.getTiddlers(title,sortBy,isTagExpr);

		if (sortOrder == "desc")
			list = list.reverse();

		var leftOvers = []
		for (var i=0;i<list.length;i++)
			leftOvers.push(list[i].title);

		var allTagsHolder = {};
		for (var i=0;i<list.length;i++) {
			for (var j=0;j<list[i].tags.length;j++) {

				if (list[i].tags[j] != title) { // not this tiddler

					if (this.notHidden(list[i].tags[j],title)) {

						if (!allTagsHolder[list[i].tags[j]])
							allTagsHolder[list[i].tags[j]] = "";

						if (this.notHidden(list[i],title)) {
							allTagsHolder[list[i].tags[j]] += "**[["+list[i].title+"]]"
										+ this.getTaggingCount(list[i].title) + this.getExcerpt(title,list[i].title) + "\n";

							leftOvers.setItem(list[i].title,-1); // remove from leftovers. at the end it will contain the leftovers

						}
					}
				}
			}
		}

		var allTags = [];
		for (var t in allTagsHolder)
			allTags.push(t);

		var sortHelper = function(a,b) {
			if (a == b) return 0;
			if (a < b) return -1;
			return 1;
		};

		allTags.sort(function(a,b) {
			var tidA = store.getTiddler(a);
			var tidB = store.getTiddler(b);
			if (sortBy == "title") return sortHelper(a,b);
			else if (!tidA && !tidB) return 0;
			else if (!tidA) return -1;
			else if (!tidB) return +1;
			else return sortHelper(tidA[sortBy],tidB[sortBy]);
		});

		var leftOverOutput = "";
		for (var i=0;i<leftOvers.length;i++)
			if (this.notHidden(leftOvers[i],title))
				leftOverOutput += "*[["+leftOvers[i]+"]]" + this.getTaggingCount(leftOvers[i]) + this.getExcerpt(title,leftOvers[i]) + "\n";

		var output = [];

		if (sortOrder == "desc")
			allTags.reverse();
		else if (leftOverOutput != "")
			// leftovers first...
			output.push(leftOverOutput);

		for (var i=0;i<allTags.length;i++)
			if (allTagsHolder[allTags[i]] != "")
				output.push("*[["+allTags[i]+"]]" + this.getTaggingCount(allTags[i]) + this.getExcerpt(title,allTags[i]) + "\n" + allTagsHolder[allTags[i]]);

		if (sortOrder == "desc" && leftOverOutput != "")
			// leftovers last...
			output.push(leftOverOutput);

		return this.drawTable(place,
				this.makeColumns(output,parseInt(this.getTagglyOpt(title,"numCols"))),
				"grouped");

	},

	// used to build site map
	treeTraverse: function(title,depth,sortBy,sortOrder,isTagExpr) {

		var list = config.taggly.getTiddlers(title,sortBy,isTagExpr);

		if (sortOrder == "desc")
			list.reverse();

		var indent = "";
		for (var j=0;j<depth;j++)
			indent += "*"

		var childOutput = "";

		if (depth > this.config.siteMapDepthLimit)
			childOutput += indent + this.lingo.tooDeepMessage + "\n";
		else
			for (var i=0;i<list.length;i++)
				if (list[i].title != title)
					if (this.notHidden(list[i].title,this.config.inTiddler))
						childOutput += this.treeTraverse(list[i].title,depth+1,sortBy,sortOrder,false);

		if (depth == 0)
			return childOutput;
		else
			return indent + "[["+title+"]]" + this.getTaggingCount(title) + this.getExcerpt(this.config.inTiddler,title,depth) + "\n" + childOutput;
	},

	// this if for the site map mode
	createTagglyListSiteMap: function(place,title,isTagExpr) {
		this.config.inTiddler = title; // nasty. should pass it in to traverse probably
		var output = this.treeTraverse(title,0,this.getTagglyOpt(title,"sortBy"),this.getTagglyOpt(title,"sortOrder"),isTagExpr);
		return this.drawTable(place,
				this.makeColumns(output.split(/(?=^\*\[)/m),parseInt(this.getTagglyOpt(title,"numCols"))), // regexp magic
				"sitemap"
				);
	},

	macros: {
		tagglyTagging: {
			handler: function (place,macroName,params,wikifier,paramString,tiddler) {
				var parsedParams = paramString.parseParams("tag",null,true);
				var refreshContainer = createTiddlyElement(place,"div");

				// do some refresh magic to make it keep the list fresh - thanks Saq
				refreshContainer.setAttribute("refresh","macro");
				refreshContainer.setAttribute("macroName",macroName);

				var tag = getParam(parsedParams,"tag");
				var expr = getParam(parsedParams,"expr");

				if (expr) {
					refreshContainer.setAttribute("isTagExpr","true");
					refreshContainer.setAttribute("title",expr);
					refreshContainer.setAttribute("showEmpty","true");
				}
				else {
					refreshContainer.setAttribute("isTagExpr","false");
					if (tag) {
        				refreshContainer.setAttribute("title",tag);
						refreshContainer.setAttribute("showEmpty","true");
					}
					else {
        				refreshContainer.setAttribute("title",tiddler.title);
						refreshContainer.setAttribute("showEmpty","false");
					}
				}
				this.refresh(refreshContainer);
			},

			refresh: function(place) {
				var title = place.getAttribute("title");
				var isTagExpr = place.getAttribute("isTagExpr") == "true";
				var showEmpty = place.getAttribute("showEmpty") == "true";
				removeChildren(place);
				addClass(place,"tagglyTagging");
				var countFound = config.taggly.getTiddlers(title,'title',isTagExpr).length
				if (countFound > 0 || showEmpty) {
					var lingo = config.taggly.lingo;
					config.taggly.createListControl(place,title,"hideState");
					if (config.taggly.getTagglyOpt(title,"hideState") == "show") {
						createTiddlyElement(place,"span",null,"tagglyLabel",
								isTagExpr ? lingo.labels.exprLabel.format([title]) : lingo.labels.label.format([title]));
						config.taggly.createListControl(place,title,"title");
						config.taggly.createListControl(place,title,"modified");
						config.taggly.createListControl(place,title,"created");
						config.taggly.createListControl(place,title,"listMode");
						config.taggly.createListControl(place,title,"excerpts");
						config.taggly.createListControl(place,title,"numCols");
						config.taggly.createTagglyList(place,title,isTagExpr);
						if (countFound == 0 && showEmpty)
							createTiddlyElement(place,"div",null,"tagglyNoneFound",lingo.labels.noneFound);
					}
				}
			}
		}
	},

	// todo fix these up a bit
	styles: [
"/*{{{*/",
"/* created by TagglyTaggingPlugin */",
".tagglyTagging { padding-top:0.5em; }",
".tagglyTagging li.listTitle { display:none; }",
".tagglyTagging ul {",
"	margin-top:0px; padding-top:0.5em; padding-left:2em;",
"	margin-bottom:0px; padding-bottom:0px;",
"}",
".tagglyTagging { vertical-align: top; margin:0px; padding:0px; }",
".tagglyTagging table { margin:0px; padding:0px; }",
".tagglyTagging .button { visibility:hidden; margin-left:3px; margin-right:3px; }",
".tagglyTagging .button, .tagglyTagging .hidebutton {",
"	color:[[ColorPalette::TertiaryLight]]; font-size:90%;",
"	border:0px; padding-left:0.3em;padding-right:0.3em;",
"}",
".tagglyTagging .button:hover, .hidebutton:hover, ",
".tagglyTagging .button:active, .hidebutton:active  {",
"	border:0px; background:[[ColorPalette::TertiaryPale]]; color:[[ColorPalette::TertiaryDark]];",
"}",
".selected .tagglyTagging .button { visibility:visible; }",
".tagglyTagging .hidebutton { color:[[ColorPalette::Background]]; }",
".selected .tagglyTagging .hidebutton { color:[[ColorPalette::TertiaryLight]] }",
".tagglyLabel { color:[[ColorPalette::TertiaryMid]]; font-size:90%; }",
".tagglyTagging ul {padding-top:0px; padding-bottom:0.5em; margin-left:1em; }",
".tagglyTagging ul ul {list-style-type:disc; margin-left:-1em;}",
".tagglyTagging ul ul li {margin-left:0.5em; }",
".editLabel { font-size:90%; padding-top:0.5em; }",
".tagglyTagging .commas { padding-left:1.8em; }",
"/* not technically tagglytagging but will put them here anyway */",
".tagglyTagged li.listTitle { display:none; }",
".tagglyTagged li { display: inline; font-size:90%; }",
".tagglyTagged ul { margin:0px; padding:0px; }",
".excerpt { color:[[ColorPalette::TertiaryDark]]; }",
".excerptIndent { margin-left:4em; }",
"div.tagglyTagging table,",
"div.tagglyTagging table tr,",
"td.tagglyTagging",
" {border-style:none!important; }",
".tagglyTagging .contents { border-bottom:2px solid [[ColorPalette::TertiaryPale]]; padding:0 1em 1em 0.5em;",
"  margin-bottom:0.5em; }",
".tagglyTagging .indent1  { margin-left:3em;  }",
".tagglyTagging .indent2  { margin-left:4em;  }",
".tagglyTagging .indent3  { margin-left:5em;  }",
".tagglyTagging .indent4  { margin-left:6em;  }",
".tagglyTagging .indent5  { margin-left:7em;  }",
".tagglyTagging .indent6  { margin-left:8em;  }",
".tagglyTagging .indent7  { margin-left:9em;  }",
".tagglyTagging .indent8  { margin-left:10em; }",
".tagglyTagging .indent9  { margin-left:11em; }",
".tagglyTagging .indent10 { margin-left:12em; }",
".tagglyNoneFound { margin-left:2em; color:[[ColorPalette::TertiaryMid]]; font-size:90%; font-style:italic; }",
"/*}}}*/",
		""].join("\n"),

	init: function() {
		merge(config.macros,this.macros);
		config.shadowTiddlers["TagglyTaggingStyles"] = this.styles;
		store.addNotification("TagglyTaggingStyles",refreshStyles);
	}
};

config.taggly.init();

//}}}

/***
InlineSlidersPlugin
By Saq Imtiaz
http://tw.lewcid.org/sandbox/#InlineSlidersPlugin

// syntax adjusted to not clash with NestedSlidersPlugin
// added + syntax to start open instead of closed

***/
//{{{
config.formatters.unshift( {
	name: "inlinesliders",
	// match: "\\+\\+\\+\\+|\\<slider",
	match: "\\<slider",
	// lookaheadRegExp: /(?:\+\+\+\+|<slider) (.*?)(?:>?)\n((?:.|\n)*?)\n(?:====|<\/slider>)/mg,
	lookaheadRegExp: /(?:<slider)(\+?) (.*?)(?:>)\n((?:.|\n)*?)\n(?:<\/slider>)/mg,
	handler: function(w) {
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart ) {
			var btn = createTiddlyButton(w.output,lookaheadMatch[2] + " "+"\u00BB",lookaheadMatch[2],this.onClickSlider,"button sliderButton");
			var panel = createTiddlyElement(w.output,"div",null,"sliderPanel");
			panel.style.display = (lookaheadMatch[1] == '+' ? "block" : "none");
			wikify(lookaheadMatch[3],panel);
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
   },
   onClickSlider : function(e) {
		if(!e) var e = window.event;
		var n = this.nextSibling;
		n.style.display = (n.style.display=="none") ? "block" : "none";
		return false;
	}
});

//}}}

