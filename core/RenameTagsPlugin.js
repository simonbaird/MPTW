/***
|Name:|RenameTagsPlugin|
|Description:|Allows you to easily rename or delete tags across multiple tiddlers|
|Version:|3.0a|
|Date:|27-Jun-2011|
|Source:|http://mptw.tiddlyspot.com/#RenameTagsPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License|http://mptw.tiddlyspot.com/#TheBSDLicense|
Rename a tag and you will be prompted to rename it in all its tagged tiddlers.
***/
//{{{
config.renameTags = {

  prompts: {
    rename: "Rename the tag '%0' to '%1' in %2 tidder%3?",
    remove: "Remove the tag '%0' from %1 tidder%2?"
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

  storeMethods: {

    saveTiddler_orig_renameTags: TiddlyWiki.prototype.saveTiddler,

    saveTiddler: function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created,creator) {
      if (title != newTitle) {
        var tagged = this.getTaggedTiddlers(title);
        if (tagged.length > 0) {
          // then we are renaming a tag
          if (confirm(config.renameTags.prompts.rename.format([title,newTitle,tagged.length,tagged.length>1?"s":""])))
            config.renameTags.renameTag(title,newTitle,tagged);

          if (!this.tiddlerExists(title) && newBody == "")
            // dont create unwanted tiddler
            return null;
        }
      }
      return this.saveTiddler_orig_renameTags(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created,creator);
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
