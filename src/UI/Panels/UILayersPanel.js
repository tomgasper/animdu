import { RenderableObject } from "../../RenderableObject.js";
import { UIObject } from "../UIObject.js";

import { getProjectionMat } from "../../utils.js";

import { CustomBuffer } from "../../Primitives/CustomBuffer.js";
import { createNewText } from "../../Text/textHelper.js";
import { UIBuffers } from "../UIBuffers.js";

import { UILayersPanelEntry } from "./UILayersPanelEntry.js";

export class UILayersPanel extends UIObject
{
    objects = [];

    marginX = 0.;
    marginY = 0.;

    offsetY = 50.0;

    containerColor = [0.3,0.4,0.7,1];
    container = undefined;

    entries = [];

    x_txt_margin = undefined;
    x_offset = undefined;
    y_offset = undefined;

    entry_distance = undefined;
    entry_height = undefined;
    entry_width = undefined;

    width = undefined;

    appRef = undefined;
    UIRef = undefined;

    UIBuffers = undefined;

    // we must input objects from current comp
    constructor(appRef, UIRef, buffersStore)
    {
        super();

        this.appRef = appRef;
        this.UIRef = UIRef;

        // create buffers for panel objects
        this.setDimensions();

        this.UIBuffers = this.createBuffers(this.appRef, this.appRef.programs[0], buffersStore);

        this.createPanel(this.appRef.activeComp.objects);
        // this.pushObjsToRenderer();
    }

    setDimensions( widthSize = 0.2 )
    {
        this.screen_width = this.appRef.gl.canvas.clientWidth;
        this.screen_height = this.appRef.gl.canvas.clientHeight;

        this.x_offset = this.screen_width * 0.02;
        this.y_offset = this.screen_height * 0.02;

        this.x_txt_margin = this.screen_width * 0.03;

        this.width = this.screen_width * widthSize;

        this.entry_distance = this.screen_height * 0.05;

        this.entry_width = this.width;
        this.entry_height = this.screen_height * 0.03;
    }

    createBuffers(app, program, buffersStore)
    {
        if (typeof this.width !== "number" || typeof this.entry_height !== "number") throw new Error("Incorrect Layers Panel size");

        const UILayerPanelEntryDims = [ this.entry_width, this.entry_height];
        return buffersStore.createUILayerBuffers(app.gl, program, UILayerPanelEntryDims);
    }

    createPanel(compObjs)
    {
        this.setDimensions();
        
        this.container = this.createContainer(this.appRef, this.UIRef);

        this.createEntries(compObjs);
    }

    createContainer(app, UI)
    {
        const projectionMat = getProjectionMat(app.gl);
        const screen_width = this.appRef.gl.canvas.clientWidth;
        const screen_height = this.appRef.gl.canvas.clientHeight;

        // retrive bar height from main UI object
        const barHeight = UI.topBarHeight;

        const customVertsPos = [ 0, 0,
                                this.width, 0,
                                this.width, UI.viewerStartY-barHeight,
                                
                                this.width, UI.viewerStartY-barHeight,
                                0, UI.viewerStartY-barHeight,
                                0, 0 ];

        const UIParamsPanelBuffer = new CustomBuffer(app.gl, app.programs[0], customVertsPos);
        const UIParamsPanelInfo = UIParamsPanelBuffer.getInfo();

        const UIParamsPanel = new RenderableObject(UIParamsPanelInfo, projectionMat);

        // offset to the right and down
        UIParamsPanel.setPosition([this.screen_width-this.width,barHeight]);

        UIParamsPanel.setCanBeMoved(false);
        UIParamsPanel.setCanBeHighlighted(false);
        UIParamsPanel.setColor([0,0.3,0.2,1]);
        UIParamsPanel.setOriginalColor([0.5,0.5,0.5,1]);

        return UIParamsPanel;
    }

    createEntries(compObjs)
    {
        this.entries = [];

        // for each object render one UI Element
        compObjs.forEach((obj, i) => {
            const newEntry = new UILayersPanelEntry(this, this.container, obj, i);

            this.entries.push(newEntry);
        });
    }

    pushObjsToRenderer()
    {
        this.UIRef.addObj( this.container, ["panels", "layers"]);

        this.entries.forEach( entry => this.UIRef.addObj(entry.objects, ["panels", "layers"] ));
    }

    updateEntries()
    {
        this.entries.forEach( (entry, i) => { entry.update(this, i); } );
    }
}