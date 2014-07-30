const Lang = imports.lang;
const St = imports.gi.St;
const Settings = imports.ui.settings;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const AppletManager = imports.ui.appletManager;
const Layout = imports.ui.layout;
const Mainloop = imports.mainloop;
const Gettext = imports.gettext.domain('cinnamon-applets');
const _ = Gettext.gettext;

/*
 * Container for old attributes and functions for later restore 
 */
let old = {
	main:{},
	layoutmanager:{},
	appletmanager:{},
	applet:{}
};

/**
 * called when extension is loaded
 */
function init(extensionMeta) {
  //extensionMeta holds your metadata.json info
  const UUID = extensionMeta['uuid'];
}

/**
 * called when extension is loaded
 */
function enable() {
	global.log("enabling morePanels");
	patchLayoutManager();
  patchMain();
	patchAppletManager();

	Main.patchedStart();
	Main.enablePanels();

	AppletManager.onEnabledAppletsChanged();
  Main.layoutManager._monitorsChanged();
	Main.layoutManager._windowsRestacked();
	Main.layoutManager._processPanelSettings(); 
}

/**
 * called when extension gets disabled
 */
function disable() {
	unpatchLayoutManager();
	unpatchMain();	
	unpatchAppletManager();
  Main.layoutManager._monitorsChanged();
	Main.layoutManager._windowsRestacked();
	Main.layoutManager._processPanelSettings(); 
}

