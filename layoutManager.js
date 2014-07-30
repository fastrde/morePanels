function unpatchLayoutManager(){
	Main.layoutManager._leftPanelBarrier    = old.layoutmanager._leftPanelBarrier;
	Main.layoutManager._rightPanelBarrier   = old.layoutmanager._rightPanelBarrier;
	Main.layoutManager._leftPanelBarrier2   = old.layoutmanager._leftPanelBarrier2;
	Main.layoutManager._rightPanelBarrier2  = old.layoutmanager._rightPanelBarrier2;
	Main.layoutManager.panelBox             = old.layoutmanager.panelBox;
	Main.layoutManager.panelBox2            = old.layoutmanager.panelBox2;
	Main.layoutManager._updateBoxes         = old.layoutmanager._updateBoxes;
	Main.layoutManager._updatePanelBarriers = old.layoutmanager._updatePanelBarriers;
	Main.layoutManager._processPanelSettings= old.layoutmanager._processPanelSettings;
	Main.layoutManager._startupAnimation    = old.layoutmanager._startupAnimation;
	Main.layoutManager.addChrome(Main.layoutManager.panelBox, { addToWindowgroup: false });
  Main.layoutManager.addChrome(Main.layoutManager.panelBox2, { addToWindowgroup: false });
}

function patchLayoutManager(){
	
	let lm = Main.layoutManager;
	old.layoutmanager._leftPanelBarrier = lm._leftPanelBarrier;
	delete lm._leftPanelBarrier;
	old.layoutmanager._rightPanelBarrier = lm._rightPanelBarrier;
	delete lm._rightPanelBarrier;
	old.layoutmanager._leftPanelBarrier2 = lm._leftPanelBarrier2;
	delete lm._leftPanelBarrier2;
	old.layoutmanager._rightPanelBarrier2 = lm._rightPanelBarrier2;
	delete lm._rightPanelBarrier2;
	old.layoutmanager.panelBox = lm.panelBox;
  lm.removeChrome(lm.panelBox);
	delete lm.panelBox;
	old.layoutmanager.panelBox2 = lm.panelBox2;
  lm.removeChrome(lm.panelBox2);
	delete lm.panelBox2;

  lm.panelManager = Main.panelManager;

/*************************************************************************************************** overwrite LayoutManager._updateBoxes */
	old.layoutmanager._updateBoxes = lm._updateBoxes;
	lm._updateBoxes = function(){
    this._updateHotCorners();

    let getPanelHeight = function(panel) {
      let panelHeight = 0;
      if (panel) {
        panelHeight = panel.actor.get_height();
      }
      return panelHeight;
    };
		
		for (let i = 0; i < Main.panelManager.panels.length; i++){
			let pc = Main.panelManager.panels[i];
    	let pHeight = getPanelHeight(pc.panel);
			let monitor = this.monitors[pc.monitor];
			if (pc.position = 'bottom'){
      	pc.box.set_size(monitor.width, pHeight);
      	pc.box.set_position(monitor.x, monitor.y + monitor.height - pHeight);
			}else{
      	pc.box.set_size(monitor.width, pHeight);
        pc.box.set_position(monitor.x, monitor.y);
			}	
		}
    this.keyboardBox.set_position(this.bottomMonitor.x,
                                  this.bottomMonitor.y + this.bottomMonitor.height);
    this.keyboardBox.set_size(this.bottomMonitor.width, -1);
    this._chrome._queueUpdateRegions();
	}

/*************************************************************************************************** overwrite LayoutManager._updatePanelBarriers */
	old.layoutmanager._updatePanelBarriers = lm._updatePanelBarriers;
	lm._updatePanelBarriers = function(panelBox){
    /* start: I dont like barriers */
		if (leftPanelBarrier)
      global.destroy_pointer_barrier(leftPanelBarrier);
    if (rightPanelBarrier)
      global.destroy_pointer_barrier(rightPanelBarrier);
		return;
	  /* end: I dont like barriers */
		let leftPanelBarrier;
    let rightPanelBarrier;

		let pc = Main.PanelManager.getContainerFromBox(panelBox);
		
		leftPanelBarrier = pc.barrier[0];
		rightPanelBarrier = pc.barrier[1];

    if (leftPanelBarrier)
      global.destroy_pointer_barrier(leftPanelBarrier);
    if (rightPanelBarrier)
      global.destroy_pointer_barrier(rightPanelBarrier);
    if (panelBox.height) {                        
      if ((Main.desktop_layout == Main.LAYOUT_TRADITIONAL && panelBox==pc.box) || (Main.desktop_layout == Main.LAYOUT_CLASSIC && panelBox==pc.box)) {
        let monitor = this.monitors[pc.monitor];
        leftPanelBarrier = global.create_pointer_barrier(monitor.x, monitor.y + monitor.height - panelBox.height,
                                                         monitor.x, monitor.y + monitor.height,
                                                         1 /* BarrierPositiveX */);
        rightPanelBarrier = global.create_pointer_barrier(monitor.x + monitor.width, monitor.y + monitor.height - panelBox.height,
                                                          monitor.x + monitor.width, monitor.y + monitor.height,
                                                          4 /* BarrierNegativeX */);
      }
      else {
        let primary = this.monitors[pc.monitor];
        leftPanelBarrier = global.create_pointer_barrier(primary.x, primary.y,
                                                         primary.x, primary.y + panelBox.height,
                                                         1 /* BarrierPositiveX */);
        rightPanelBarrier = global.create_pointer_barrier(primary.x + primary.width, primary.y,
                                                          primary.x + primary.width, primary.y + panelBox.height,
                                                          4 /* BarrierNegativeX */);
      }
    } else {
      leftPanelBarrier = 0;
      rightPanelBarrier = 0;
    }
		pc.barrier[0] = leftPanelBarrier;
    pc.barrier[1] = rightPanelBarrier;
	}
	old.layoutmanager._processPanelSettings = lm._processPanelSettings;
  lm._processPanelSettings = function() {
        if (this._processPanelSettingsTimeout) {
            Mainloop.source_remove(this._processPanelSettingsTimeout);
        }
        // delay this action somewhat, to let others do their thing before us
        this._processPanelSettingsTimeout = Mainloop.timeout_add(0, Lang.bind(this, function() {
            this._processPanelSettingsTimeout = 0;
            this._updateBoxes();
						for (var i = 0; i < Main.panelManager.panels.length; i ++){
							let pc = Main.panelManager.panels[i];
            	this._chrome.modifyActorParams(pc.box, { affectsStruts: pc.panel && !pc.panel.isHideable() });
						} 
        }));
    },

/*************************************************************************************************** overwrite LayoutManager._startupAnimation */
/* doesn't work at the moment */
	old.layoutmanager._startupAnimation = lm._startupAnimation;
	lm._startupAnimation = function(){
    this._chrome.freezeUpdateRegions();
    let params = { anchor_y: 0,
                   time: Main.LayoutManager.STARTUP_ANIMATION_TIME,
                   transition: 'easeOutQuad',
                   onComplete: this._startupAnimationComplete,
                   onCompleteScope: this
                 };
        
		for(var i=0;i < Main.panelManager.panels.length ; i++){
			let pc = Main.panelManager.panels[i];
			pc.box.anchor_y = (pc.location=='bottom')? -(pc.box.height) : pc.box.height;	
    	Tweener.addTween(pc.box, params);
		}
	}
}
