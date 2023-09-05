import { RenderableObject } from "../RenderableObject.js";
import { initalizeApp } from "./initializeApp.js";
import { initInputListeners } from "./initializeApp.js";
import { prepareForFirstPass, prepareForScndPass, retrieveRenderObjs, addNewComposition, resetMouseClick, resizeCanvas } from "./AppHelper.js";
import { drawPass } from "./AppDraw.js";

import { handleEvents } from "./AppHandlers.js";

import { UI } from "../UI/UI.js";
import { UINodeParamList } from "../UI/Node/UINodeParamList.js";
import { UINodeParam } from "../UI/Node/UINodeParam.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { Effector } from "../UI/Node/Effector.js";
import { Component } from "../UI/Node/Component.js";

export class App
{
    gl = {};
    programs = [];
    canvas = {};
    document = {};

    time = 0.;
    fps = 0.;

    primitiveBuffers = undefined;

    objsToDraw = [];

    framebuffer = {};
    depthBuffer = {};
    renderTexture = {};

    isMouseDown = false;
    isMouseClicked = false;
    isMouseClickedTwice = false;
    clickOffset = undefined;
    mouseX = 0;
    mouseY = 0;

    pickingData = new Uint8Array(4);

    comps = [];
    activeComp = {};

    UI;
    fontUI = undefined;

    activeObjID = -1;
    activeObjArrIndx = -1;

    prevActiveObjID = -1;
    prevActiveObjArrIndx = -1;

    objectIDtoDrag = -1;
    objectToDragArrIndx = -1;

    objUnderMouseID = -1;
    objUnderMouseArrIndx = -1;

    eventsToProcess = [];

    constructor(gl, canvas, programsInfo, framebuffer, depthBuffer, renderTexture)
    {

        // save gl for local use
        this.gl = gl;
        this.ext = this.gl.getExtension('GMAN_webgl_memory');
        this.document = gl.canvas.parentNode;
        this.programs = programsInfo;
        this.canvas = canvas;

        this.framebuffer = framebuffer;
        this.depthBuffer = depthBuffer;
        this.renderTexture = renderTexture;

        // All input listeners initialized here
        initInputListeners(this);

        // Start the app
        this.start();
    }

    start()
    {
        // Set up primitve buffers, font etc.
        initalizeApp(this);

        // Create UI
        this.UI = new UI(this);

        // Create main comp and set it as active
        const mainComp = addNewComposition(this, "Main comp", this.UI.viewport);

        // Background
        const solidBuffer = new RectangleBuffer(this.gl, this.programs[0], [this.activeComp.viewport.width, this.activeComp.viewport.height]);
        const solid = new RenderableObject(solidBuffer.getInfo());

        solid.setPosition([0,0]);
        solid.setCanBeMoved(false);
        solid.setCanBeHighlighted(false);
        solid.setOriginalColor([0.97,0.97,0.97,1]);

        const obj1 = new RenderableObject(this.primitiveBuffers.circle);
        obj1.setPosition([0,0]);
        obj1.setScale([1,1]);

        const obj2 = new RenderableObject(this.primitiveBuffers.circle);
        obj2.setPosition([100,0]);
        obj2.setScale([0.5,1]);

        const obj3 = new RenderableObject(this.primitiveBuffers.rectangle);
        obj3.setPosition([200, 0]);
        obj3.setScale([1,1]);

        const obj4 = new RenderableObject(this.primitiveBuffers.circle);
        obj4.setPosition([300, 0]);

        obj4.setParent(obj3);
        obj3.setParent(obj2);
        obj2.setParent(obj1);

        this.activeComp.addObj([solid, obj1,obj2,obj3, obj4]);

        const paramList = new UINodeParamList([
            new UINodeParam("position", "TEXT_READ"),
            new UINodeParam("scale", "TEXT_READ")
        ]);

        const fnc = () => console.log("Hello, this is some function!");
        const effectorFunction = new Effector("Custom function", fnc, 3, 2)
        const compNode = new Component(this, [500, 300], [0.1,0.1,0.1,1], "myComponent");
        compNode.addParamNode("IN", paramList);
        compNode.addFunctionNode(effectorFunction);
        compNode.addParamNode("OUT", paramList);

        const fnc2 = () => console.log("Another function!");
        const effectorFunction2 = new Effector("Custom function2", fnc2, 3, 2)
        const compNode2 = new Component(this, [600, 300], [0.1,0.1,0.1,1], "myComponent2");
        compNode2.addParamNode("IN", paramList);
        compNode2.addFunctionNode(effectorFunction2);
        compNode2.addParamNode("OUT", paramList);

        // this.UI.addObj(compNode.getObjsToRender(), ["nodes"]);
        compNode.setPosition([500,500]);
        compNode2.setPosition([500,400]);

        // Finally can update UI fully
        // Might move to DOM UI...
        // this.UI.initLayersPanel(this);
    }

    // render loop function called from RenderLoop class
    doFrame(elapsedTime, fps)
    {
        // convert elapsed time in ms to s
        this.time = elapsedTime * 0.001;
        this.fps = fps;

        // calculate world matrices for all objects
        // this.UI.viewer.container.children.forEach( (obj) => obj.updateWorldMatrix() );

        // Gather objs to draw
        this.createDrawList(this.UI, this.activeComp.objects);
        this.drawFrame();
    }

    createDrawList()
    {
        // need to:
        // 1. calc world matrices for each object
        // 2. render via tree traversal

        const viewerObjs = retrieveRenderObjs(this.UI.viewer);
        const activeCompObjs = retrieveRenderObjs(this.activeComp.viewport);

        this.objsToDraw = [
            { mask: [ this.UI.viewer.container ], objs: [ ...viewerObjs ] },
            // { mask: [], objs: UI.panels.layers.objects },
            { mask: [ this.UI.viewport.container ], objs: [ ...activeCompObjs] },
        ];
    }

    drawFrame()
    {
        // Resize canvas to display
        resizeCanvas(this);

        const UIList = 0;
        const activeCompList = 1;

        // Shaders
        const objShader = undefined;
        const pickingShader = 1;

        // Draw to texture - PASS 1
        prepareForFirstPass(this.gl, this.framebuffer, [this.mouseX, this.mouseY]);
        this.drawUI(UIList, pickingShader);
        this.drawComp(activeCompList, pickingShader);

        handleEvents(this);

        // 2nd Pass - Draw "normally"
        prepareForScndPass(this.gl);
        // passing undefined program so each object uses its own shader
        this.drawUI(UIList, objShader);
        this.drawComp(activeCompList, objShader);

        resetMouseClick(this);
    }

    drawUI(listToUse, programIndx)
    {
        drawPass(this, [this.objsToDraw[listToUse]], this.programs[programIndx], listToUse);
    }

    drawComp(listToUse, programIndx)
    {
        const [viewportOffsetX, viewportOffsetY] = this.UI.viewport.position;
        this.gl.viewport(viewportOffsetX, viewportOffsetY, this.gl.canvas.width, this.gl.canvas.height);
        drawPass(this,[this.objsToDraw[listToUse]], this.programs[programIndx], listToUse);
    }
}