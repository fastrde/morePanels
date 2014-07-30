function unpatchAppletManager(){
  AppletManager.getAppletDefinition  = old.appletmanager.getAppletDefinition;
	AppletManager.saveAppletsPositions = old.appletmanager.saveAppletsPositions; 
	AppletManager.onEnabledAppletsChanged();
}

function patchAppletManager(){
	let am = AppletManager;

/*************************************************************************************************** overwrite AppletManager.getAppletDefinition */
	old.appletmanager.getAppletDefinition = am.getAppletDefinition;
	am.getAppletDefinition = function(definition) {
		global.log(definition);
    let elements = definition.split(":");
    if (elements.length > 4) {
				let panelid = elements[0];
				if (elements[0] == "panel1"){
					panelid = 0;
				}
				else if (elements[0] == "panel2"){
					panelid = 1;
				}
				if (!Main.panelManager.panels[panelid]){
					panelid = 0;
				}
				let panel = Main.panelManager.panels[panelid].panel;
        let orientation = panel.bottomPosition ? St.Side.BOTTOM : St.Side.TOP;
        let order;
        try { order = parseInt(elements[2]); } catch(e) { order = 0; }
        
        let location = panel._leftBox;
        let center = elements[1] == "center";
        if (center)
            location = panel._centerBox;
        else if (elements[1] == "right")
            location = panel._rightBox;
        
        return {
            panel: panel,
            orientation: orientation,
            location: location,
            center: center,
            order: order,
            uuid: elements[3],
            applet_id: elements[4]
        };
    }
    global.logError("Bad applet definition: " + definition);
    return null;
	}
/*************************************************************************************************** overwrite AppletManager.saveAppletsPositions */
	old.appletmanager.saveAppletsPositions = am.saveAppletsPositions;
  am.saveAppletsPositions = function() {
		global.log("saveAppletsPositions");
		let panels = Main.panelManager.getPanels();
    let zones_strings = ["left", "center", "right"];
    let allApplets = new Array();
    for (var i in panels){
        let panel = panels[i];
				global.log(panel);
        if (!panel) continue;
        for (var j in zones_strings){
            let zone_string = zones_strings[j];
            let zone = panel["_"+zone_string+"Box"];
            let children = zone.get_children();
            for (var k in children) if (children[k]._applet) allApplets.push(children[k]._applet);
        }
    }
    let applets = new Array();
    for (var i in panels){
        let panel = panels[i];
        if (!panel) continue;
        let panel_string;
				panel_string = i;
        for (var j in zones_strings){
            let zone_string = zones_strings[j];
            let zone = panel["_"+zone_string+"Box"];
            for (var k in allApplets){
                let applet = allApplets[k];
                let appletZone;
                if (applet._newPanelLocation != null) appletZone = applet._newPanelLocation;
                else appletZone = applet._panelLocation;
                let appletOrder;
                if (applet._newOrder != null) appletOrder = applet._newOrder;
                else appletOrder = applet._order;

                if (appletZone == zone) applets.push(panel_string+":"+zone_string+":"+appletOrder+":"+applet._uuid+":"+applet.instance_id);
            }
        }
    }
    for (var i in allApplets){
        allApplets[i]._newPanelLocation = null;
        allApplets[i]._newOrder = null;
    }
    global.settings.set_strv('enabled-applets', applets);
	}
}
