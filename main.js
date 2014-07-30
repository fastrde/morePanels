function unpatchMain(){
	Main.disablePanels();
	Main.panelManager.removePanels();
	delete Main.LAYOUT_FREE;
  Main.panel  = old.main.panel;
  Main.panel2 = old.main.panel2;
  delete Main.panelManager;
  Main.enablePanels = old.main.enablePanels;
  Main.disablePanels = old.main.disablePanels;
  Main.getPanels = old.main.getPanels;
  delete Main.patchedStart;
	Main.enablePanels();
}

function patchMain(){
  Main.LAYOUT_FREE = "free";
	Main.disablePanels();
	old.main.panel = Main.panel;
	delete Main.panel;
	old.main.panel2 = Main.panel2;
	delete Main.panel2;

	Main.panelManager = new PanelManager();

	old.main.enablePanels = Main.enablePanels;
	Main.enablePanels = function(){
		this.panelManager.enablePanels();
	}
	old.main.disablePanels = Main.disablePanels;
	Main.disablePanels = function(){
		this.panelManager.disablePanels();
	}
	old.main.getPanels = Main.getPanels;
  Main.getPanels = function(){
    return this.panelManager.getPanels();
	}
	Main.patchedStart = function(){
		this.panelManager._onSettingsChanged();
		/*desktop_layout = global.settings.get_string("desktop-layout");
	  if (desktop_layout == Main.LAYOUT_TRADITIONAL) {
			this.panelManager.addPanel(this.layoutManager.primaryIndex, 'bottom');
    }
    else if (desktop_layout == Main.LAYOUT_FLIPPED) {
			this.panelManager.addPanel(this.layoutManager.primaryIndex, 'top');
    }
    else if (desktop_layout == Main.LAYOUT_FREE) {
			this.panelManager.addPanel(this.layoutManager.primaryIndex, 'top');
		}
    else {
      desktop_layout == Main.LAYOUT_CLASSIC;
			this.panelManager.addPanel(this.layoutManager.primaryIndex, 'top');
			this.panelManager.addPanel(this.layoutManager.primaryIndex, 'bottom');
    }
    this.layoutManager._updateBoxes();
		this.layoutManager._updatePanelBarriers();
		*/
	} 
}
