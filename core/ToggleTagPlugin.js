/***
|Name:|ToggleTagPlugin|
|Description:|Makes a checkbox which toggles a tag in a tiddler|
|Version:|3.1.0 ($Rev: 4907 $)|
|Date:|$Date: 2008-05-13 03:15:46 +1000 (Tue, 13 May 2008) $|
|Source:|http://mptw.tiddlyspot.com/#ToggleTagPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
!!Usage
{{{<<toggleTag }}}//{{{TagName TiddlerName LabelText}}}//{{{>>}}}
* TagName - the tag to be toggled, default value "checked"
* TiddlerName - the tiddler to toggle the tag in, default value the current tiddler
* LabelText - the text (gets wikified) to put next to the check box, default value is '{{{[[TagName]]}}}' or '{{{[[TagName]] [[TiddlerName]]}}}'
(If a parameter is '.' then the default will be used)
* TouchMod flag - if non empty then touch the tiddlers mod date. Note, can set config.toggleTagAlwaysTouchModDate to always touch mod date
!!Examples
|Code|Description|Example|h
|{{{<<toggleTag>>}}}|Toggles the default tag (checked) in this tiddler|<<toggleTag>>|
|{{{<<toggleTag TagName>>}}}|Toggles the TagName tag in this tiddler|<<toggleTag TagName>>|
|{{{<<toggleTag TagName TiddlerName>>}}}|Toggles the TagName tag in the TiddlerName tiddler|<<toggleTag TagName TiddlerName>>|
|{{{<<toggleTag TagName TiddlerName 'click me'>>}}}|Same but with custom label|<<toggleTag TagName TiddlerName 'click me'>>|
|{{{<<toggleTag . . 'click me'>>}}}|dot means use default value|<<toggleTag . . 'click me'>>|
!!Notes
* If TiddlerName doesn't exist it will be silently created
* Set label to '-' to specify no label
* See also http://mgtd-alpha.tiddlyspot.com/#ToggleTag2
!!Known issues
* Doesn't smoothly handle the case where you toggle a tag in a tiddler that is current open for editing
* Should convert to use named params
***/
//{{{

if (config.toggleTagAlwaysTouchModDate == undefined) config.toggleTagAlwaysTouchModDate = false;

merge(config.macros,{

	toggleTag: {

		createIfRequired: true,
		shortLabel: "[[%0]]",
		longLabel: "[[%0]] [[%1]]",

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			var tiddlerTitle = tiddler ? tiddler.title : '';
			var tag   = (params[0] && params[0] != '.') ? params[0] : "checked";
			var title = (params[1] && params[1] != '.') ? params[1] : tiddlerTitle;
			var defaultLabel = (title == tiddlerTitle ? this.shortLabel : this.longLabel);
			var label = (params[2] && params[2] != '.') ? params[2] : defaultLabel;
			var touchMod = (params[3] && params[3] != '.') ? params[3] : "";
			label = (label == '-' ? '' : label); // dash means no label
			var theTiddler = (title == tiddlerTitle ? tiddler : store.getTiddler(title));
			var cb = createTiddlyCheckbox(place, label.format([tag,title]), theTiddler && theTiddler.isTagged(tag), function(e) {
				if (!store.tiddlerExists(title)) {
					if (config.macros.toggleTag.createIfRequired) {
						var content = store.getTiddlerText(title); // just in case it's a shadow
						store.saveTiddler(title,title,content?content:"",config.options.txtUserName,new Date(),null);
					}
					else 
						return false;
				}
				if ((touchMod != "" || config.toggleTagAlwaysTouchModDate) && theTiddler)
						theTiddler.modified = new Date();
				store.setTiddlerTag(title,this.checked,tag);
				return true;
			});
		}
	}
});

//}}}

