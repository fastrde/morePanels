/********************************************************************************************************************************************************* PANELMANAGER **/
const MAX_MONITORS = 6;
function PanelManager(){
	this._init.apply(this, arguments);
}

PanelManager.prototype = {
	_init: function(){
		this.panels = [];		
		this.sp = new Settings.ExtensionSettings(this, "morePanels@fastr.de");
		this.sp.connect("settings-changed", Lang.bind(this, this._onSettingsChanged));
	},
  _onSettingsChanged: function(){
		this.removePanels();
		this.panels = [];
		let lmMonitors = Main.layoutManager.monitors.length;
		let nMonitors = (MAX_MONITORS < lmMonitors)? MAX_MONITORS : lmMonitors; 
		global.log("Monitors: "+ nMonitors);
		for(let i=0;i < nMonitors; i++){

			if (this.sp.getValue(i+":1")){
				this.addPanel(i, 'top');
			}
			if (this.sp.getValue(i+":2")){
				this.addPanel(i, 'bottom');
			}
		}
		global.log("changed something");
		AppletManager.onEnabledAppletsChanged();
	  Main.layoutManager._processPanelSettings(); 
	},
/*************************************************************************************************** adds a Panel to the 'monitor' at the given 'position' */
/* monitor: Index of Monitor in layoutManager.monitors */
/* position: 'bottom' or 'top' */
	addPanel:  function(monitor, position){
		let isPrimaryPanel = (this.panels.length==0)? true : false;
		let bottom         = (position == 'bottom')? true: false;

	 	let p = {
			panel: new Panel.Panel(bottom, isPrimaryPanel),
			box: new St.BoxLayout({ name: 'panelBox', vertical: true }),
			barrier: [0,0],
      monitor: monitor,
      position: position
		};		
  	let panelHeight = p.box.get_height();
    Main.layoutManager.addChrome(p.box, { addToWindowgroup: false });
    //p.box.connect('allocation-changed', Lang.bind(Main.layoutManager, Main.layoutManager._updatePanelBarriers));
		p.panel.actor.add_style_class_name('panel-' + position);
		p.box.add(p.panel.actor);
		p.panel.enable();
    p.box.add_style_class_name('panel-' + position);
    p.box.set_size(Main.layoutManager.monitors[p.monitor].width, panelHeight);
    p.box.set_position(Main.layoutManager.monitors[p.monitor].x, Main.layoutManager.monitors[p.monitor].y + Main.layoutManager.monitors[p.monitor].height - panelHeight);
		this.panels.push(p);
	},
/*************************************************************************************************** removes the box from the layoutManagers Chrome */ 
	removePanel: function(pc){
		Main.layoutManager.removeChrome(pc.box);
	},
/*************************************************************************************************** removes all (panel-)box */ 
	removePanels: function(){
		for (let i = 0; i < this.panels.length; i++){
			let pc = this.panels[i];
			this.removePanel(pc);
		}
	},
/*************************************************************************************************** enables the panels */
	enablePanels: function(){
		for (let i = 0; i < this.panels.length; i++){
			let panel = this.panels[i].panel;
			if (panel) panel.enable();
		}
	},
/*************************************************************************************************** disables the panels */
	disablePanels: function(){
		for (let i = 0; i < this.panels.length; i++){
			let panel = this.panels[i].panel;
			if (panel) panel.disable();
		}
	},
/*************************************************************************************************** returns an array of panels */
  getPanels: function(){
		let panels = [];
		for (let i = 0; i < this.panels.length; i++){
			let panel = this.panels[i].panel;
			panels.push(panel);
		}
    return panels;
	},
/*************************************************************************************************** returns the "panelContainer" of a given panelBox */
	getContainerFromBox: function(panelBox){
		for (let i = 0; i < this.panels.length; i++){
			let box = this.panels[i].box;
			if (box == panelBox)
				return this.panels[i];	
		}
		return null;
	}
}
