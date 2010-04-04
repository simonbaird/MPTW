/***
|Name:|LessBackupsPlugin|
|Description:|Intelligently limit the number of backup files you create|
|Version:|3.0.1 ($Rev: 2320 $)|
|Date:|$Date: 2007-06-18 22:37:46 +1000 (Mon, 18 Jun 2007) $|
|Source:|http://mptw.tiddlyspot.com/#LessBackupsPlugin|
|Author:|Simon Baird|
|Email:|simon.baird@gmail.com|
|License:|http://mptw.tiddlyspot.com/#TheBSDLicense|
!!Description
You end up with just backup one per year, per month, per weekday, per hour, minute, and second.  So total number won't exceed about 200 or so. Can be reduced by commenting out the seconds/minutes/hours line from modes array
!!Notes
Works in IE and Firefox only.  Algorithm by Daniel Baird. IE specific code by by Saq Imtiaz.
***/
//{{{

var MINS  = 60 * 1000;
var HOURS = 60 * MINS;
var DAYS  = 24 * HOURS;

if (!config.lessBackups) {
	config.lessBackups = {
		// comment out the ones you don't want or set config.lessBackups.modes in your 'tweaks' plugin
		modes: [
			["YYYY",  365*DAYS], // one per year for ever
			["MMM",   31*DAYS],  // one per month
			["ddd",   7*DAYS],   // one per weekday
			//["d0DD",  1*DAYS],   // one per day of month
			["h0hh",  24*HOURS], // one per hour
			["m0mm",  1*HOURS],  // one per minute
			["s0ss",  1*MINS],   // one per second
			["latest",0]         // always keep last version. (leave this).
		]
	};
}

window.getSpecialBackupPath = function(backupPath) {

	var now = new Date();

	var modes = config.lessBackups.modes;

	for (var i=0;i<modes.length;i++) {

		// the filename we will try
		var specialBackupPath = backupPath.replace(/(\.)([0-9]+\.[0-9]+)(\.html)$/,
				'$1'+now.formatString(modes[i][0]).toLowerCase()+'$3')

		// open the file
		try {
			if (config.browser.isIE) {
				var fsobject = new ActiveXObject("Scripting.FileSystemObject")
				var fileExists  = fsobject.FileExists(specialBackupPath);
				if (fileExists) {
					var fileObject = fsobject.GetFile(specialBackupPath);
					var modDate = new Date(fileObject.DateLastModified).valueOf();
				}
			}
			else {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(specialBackupPath);
				var fileExists = file.exists();
				if (fileExists) {
					var modDate = file.lastModifiedTime;
				}
			}
		}
		catch(e) {
			// give up
			return backupPath;
		}

		// expiry is used to tell if it's an 'old' one. Eg, if the month is June and there is a
		// June file on disk that's more than an month old then it must be stale so overwrite
		// note that "latest" should be always written because the expiration period is zero (see above)
		var expiry = new Date(modDate + modes[i][1]);
		if (!fileExists || now > expiry)
			return specialBackupPath;
	}
}

// hijack the core function
window.getBackupPath_mptw_orig = window.getBackupPath;
window.getBackupPath = function(localPath) {
	return getSpecialBackupPath(getBackupPath_mptw_orig(localPath));
}

//}}}

