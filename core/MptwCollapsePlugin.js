
(function($){

merge(config.macros,{
	mptwCollapse: {
		handler: function(place,macroName,params) {
			createTiddlyButton(place, params[0] == '+' ? '\u25AD' : '\u25AC', 'collapse/uncollapse', function(){
				$(story.findContainingTiddler(place)).toggleClass('collapsed');
			});
		}
	}
});

/* this doesn't work unless you have a modified ViewTempate */
config.shadowTiddlers["MptwCollapsePluginStyles"] = ""
	+".collapsed .uncollapsedView { display:none;       }"
	+".collapsedView              { display:none;       }"
	+".collapsed .collapsedView   { display:block;      }"
	+".tiddler.collapsed          { padding-bottom:1em; }"
	+".tiddler.collapsed .title   { font-size:100%;     }"
;

store.addNotification("MptwCollapsePluginStyles",refreshStyles);

})(jQuery);
