/***
|Name:|MptwConfigPlugin|
|Description:|Miscellaneous tweaks used by MPTW|
|Version:|1.0a|
|Date:|27-Jun-2011|
|Source:|http://mptw.tiddlyspot.com/#MptwConfigPlugin|
|Author:|Simon Baird <simon.baird@gmail.com>|
|License:|http://mptw.tiddlyspot.com/#MptwConfigPlugin|
!!Note: instead of editing this you should put overrides in MptwUserConfigPlugin
***/
//{{{
var originalReadOnly = readOnly;
var originalShowBackstage = showBackstage;

config.options.chkHttpReadOnly = false;  // means web visitors can experiment with your site by clicking edit
readOnly = false;                        // needed because the above doesn't work any more post 2.1 (??)
showBackstage = true;                    // show backstage for same reason

config.options.chkInsertTabs = true;     // tab inserts a tab when editing a tiddler
config.views.wikified.defaultText = "";  // don't need message when a tiddler doesn't exist
config.views.editor.defaultText = "";    // don't need message when creating a new tiddler

config.options.chkSaveBackups = true;         // do save backups
config.options.txtBackupFolder = 'twbackup';  // put backups in a backups folder

config.options.chkAutoSave = (window.location.protocol == "file:"); // do autosave if we're in local file

config.mptwVersion = "2.7.4";

config.macros.mptwVersion={handler:function(place){wikify(config.mptwVersion,place);}};

if (config.options.txtTheme == '')
  config.options.txtTheme = 'MptwTheme';

// add to default GettingStarted
config.shadowTiddlers.GettingStarted += "\n\nSee also [[MPTW]].";

// add select theme and palette controls in default OptionsPanel
config.shadowTiddlers.OptionsPanel = config.shadowTiddlers.OptionsPanel.replace(/(\n\-\-\-\-\nAlso see \[\[AdvancedOptions\]\])/, "{{select{<<selectTheme>>\n<<selectPalette>>}}}$1");

// these are used by ViewTemplate
config.mptwDateFormat = 'DD/MM/YY';
config.mptwJournalFormat = 'Journal DD/MM/YY';

//}}}
