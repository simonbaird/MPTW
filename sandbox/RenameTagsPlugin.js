/***
| Name:|RenameTagsPlugin|
| Description:|Allows you to easily rename or delete tags across multiple tiddlers|
| Version:|3.0 ($Rev: 1845 $)|
| Date:|$Date: 2007-03-16 15:19:22 +1000 (Fri, 16 Mar 2007) $|
| Source:|http://mptw.tiddlyspot.com/#RenameTagsPlugin|
| Author:|Simon Baird <simon.baird@gmail.com>|
| License|http://mptw.tiddlyspot.com/#TheBSDLicense|
Rename a tag and you will be prompted to rename it in all its tagged tiddlers.
***/
//{{{
config.renameTags = {

	prompts: {
		rename: "Rename the tag '%0' to '%1' in %2 tiddler%3?",
		remove: "Remove the tag '%0' from %1 tiddler%2?",
		update: "Rename links to '%0' to '%1' in %2 tiddler%3?"
	},

	removeTag: function(tag,tiddlers) {
		store.suspendNotifications();
		for (var i=0;i<tiddlers.length;i++) {
			store.setTiddlerTag(tiddlers[i].title,false,tag);
		}
		store.resumeNotifications();
		store.notifyAll();
	},

	renameTag: function(oldTag,newTag,tiddlers) {
		store.suspendNotifications();
		for (var i=0;i<tiddlers.length;i++) {
			store.setTiddlerTag(tiddlers[i].title,false,oldTag); // remove old
			store.setTiddlerTag(tiddlers[i].title,true,newTag);  // add new
		}
		store.resumeNotifications();
		store.notifyAll();
	},

	renameRefs: function(oldTag,newTag,tiddlers) {
		store.suspendNotifications();
		for (var i=0;i<tiddlers.length;i++) {
			var t = tiddlers[i];
			var content = t.text;
			content = content.replace(new RegExp("\\[\\["+oldTag+"\\]\\]","mg"),"[["+newTag+"]]");
			content = content.replace(new RegExp("\\|"+oldTag+"\\]\\]","mg"),"|"+newTag+"]]");
			if (oldTag.match(config.textPrimitives.wikiLink))
				content = content.replace(new RegExp("\\b"+oldTag+"\\b","mg"),String.encodeTiddlyLink(newTag));
			store.saveTiddler(t.title,t.title,content,t.modifier,t.modified,t.tags,t.fields,false,t.created);
			story.refreshTiddler(t.title,null,true);
		}
		store.resumeNotifications();
		store.notifyAll();
	},

	storeMethods: {

		saveTiddler_orig_renameTags: TiddlyWiki.prototype.saveTiddler,

		saveTiddler: function(title,newTitle,newBody,modifier,modified,tags,fields) {
			if (title != newTitle) {

				var tagged = this.getTaggedTiddlers(title);
				var refs = this.getReferringTiddlers(title);

				if (tagged.length > 0) {
					// renaming a tag
					if (confirm(config.renameTags.prompts.rename.format([title,newTitle,tagged.length,tagged.length>1?"s":""]))) {
						config.renameTags.renameTag(title,newTitle,tagged);
					}
				}

				if (refs.length > 0) {
					// renaming something that is referenced elsewhere
					if (confirm(config.renameTags.prompts.update.format([title,newTitle,refs.length,refs.length>1?"s":""]))) {
						config.renameTags.renameRefs(title,newTitle,refs);
					}
				}

				if (!this.tiddlerExists(title) && newBody == "") {
					// dont create unwanted tiddler
					return null;
				}

			}
			return this.saveTiddler_orig_renameTags(title,newTitle,newBody,modifier,modified,tags,fields);
		},

		removeTiddler_orig_renameTags: TiddlyWiki.prototype.removeTiddler,

		removeTiddler: function(title) {
			var tagged = this.getTaggedTiddlers(title);
			if (tagged.length > 0)
				if (confirm(config.renameTags.prompts.remove.format([title,tagged.length,tagged.length>1?"s":""])))
					config.renameTags.removeTag(title,tagged);
			return this.removeTiddler_orig_renameTags(title);
		}

	},

	init: function() {
		merge(TiddlyWiki.prototype,this.storeMethods);
	}
}

config.renameTags.init();

//}}}

