#!/bin/sh
DIR=morePanels@fastr.de
mkdir $DIR
cp metadata.json settings-schema.json $DIR 
cp extensionFrame.js $DIR/extension.js
cat main.js >> $DIR/extension.js
cat appletManager.js >> $DIR/extension.js
cat layoutManager.js >> $DIR/extension.js
cat panelManager.js >> $DIR/extension.js
