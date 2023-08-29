import { RenderableObject } from "../RenderableObject.js";

import { UINode } from "./Node/UINode.js";
import { ObjNode } from "./Node/ObjNode.js";

import { UINodeParam } from "./Node/UINodeParam.js";
import { UINodeParamList } from "./Node/UINodeParamList.js";

import { UILayersPanel } from "./Panels/UILayersPanel.js";

import { UIBuffers } from "./UIBuffers.js";

import { initViewer, initTopBar, initParamsPanel, setUpMainFont } from "./initializeUI.js";

import { UIViewport } from "./UIViewport.js";

export class UI
{
    app;
    
    panels = {
        params: undefined,
        layers: undefined,
    }

    viewer = {
        objects: [],
    }

    viewport = {
        objects: []
    }

    topBar = {
        objects: [],
    }

    nodes = {
        objects: [],
    }

    leftPanelWidth = 300;
    rightPanelWidth = 300;
    topBarHeight;
    viewerStartY;

    font;

    UIBuffers;
    
    constructor(app)
    {
        // Save ref to the app
        this.app = app;

        // set dimensions of different panels
        this.topBarHeight = this.app.gl.canvas.clientHeight * 0.03;
        this.viewerStartY = this.app.gl.canvas.clientHeight/2;

        this.start(app);
    }

    start(app)
    {
        this.initUI(app, this);
    }

    initUI = (app) =>
    {
        this.initializeUIBuffers(app,app.programs[0]);
        setUpMainFont(app,this);

        this.topBar.objects = initTopBar(app, this);

        this.viewport = new UIViewport(this.app, this, 800, 400, [0.6,0.6,0.6,1]);

        // initParamsPanel(app, this);

        this.viewer.objects = initViewer(app, this);
    }

    initializeUIBuffers = (app, program) => 
    {
        // Set up UI
        const UIBuffersStore = new UIBuffers();

        const UINodeSize = [130,120];
        UIBuffersStore.createUINodeBuffers(app.gl, program, UINodeSize, 0.05);

        const ObjNodeSize = [130,50];
        UIBuffersStore.createObjNodeBuffers(app.gl, program, ObjNodeSize, 0.2);

        // save ref
        this.UIBuffers = UIBuffersStore;
    }

    addNode(paramList, pos = [0,0])
    {
        let params = paramList;

        if ( paramList instanceof UINodeParamList)
        {
            params = paramList;
        }
        else if ( typeof paramList == "string" ) {
            params = new UINodeParamList(paramList);
        } else throw Error ("Incorrect input!");

        const node = new UINode(this.app, params);
        node.initialize();

        node.setPosition(pos);

        this.addObj(node.getObjsToRender(), ["nodes"]);

        return node;
    }

    addObjNode(obj, params)
    {
        const newNode = new ObjNode(obj, this.app, params);
        newNode.initialize();

        this.addObj(newNode.getObjsToRender(), ["nodes"]);
        return newNode;
    }

    addObj(obj, dir)
    {
        let dest = this[dir[0]];

        if (dir.length > 1)
        {
            for (let i = 1; i < dir.length; i++)
            {
                if (!dest[dir[i]]) throw new Error("Incorrect render location!");

                dest = dest[dir[i]];
            }
        }

        // handle array of objects
        if (obj.length && obj.length > 1)
        {
            obj.forEach((obj) => {
                if (obj && obj instanceof RenderableObject) dest.objects.push(obj);
                else if( !(obj instanceof RenderableObject) ) throw new Error("Incorrect object type for Renderer");
            });
        } else if (obj instanceof RenderableObject) dest.objects.push(obj);
    }

    removeObjs(objs, dir)
    {
        let dest = this[dir[0]];

        if (dir.length > 1)
        {
            for (let i = 1; i < dir.length; i++)
            {
                dest = dest[dir[i]];
            }
        }

        let map = {};

        for ( let i = 0; i < objs.length; i++)
        {
            map[objs[i].id] = 1;
        }

        dest.objects = dest.objects.filter( obj => { return !(obj.id in map) });
    }

    getObjs()
    {
        return this.objects;
    }

    updateObjectsPanel(comp)
    {

    }

    initLayersPanel(app)
    {
        this.panels.layers = new UILayersPanel(app, this, this.UIBuffers);
        this.panels.layers.pushObjsToRenderer();
    }
}