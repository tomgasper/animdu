import { RenderableObject } from "../RenderableObject.js";
import { getIdFromCurrentPixel, setFramebufferAttachmentSizes } from "../pickingFramebuffer.js";
import { initalizeApp } from "./initializeApp.js";
import { initInputListeners } from "./initializeApp.js";
import { prepareForFirstPass, prepareForScndPass, drawPass, canMoveObj, moveObjectWithCoursor, resetMouseClick, resizeCanvas } from "./AppHelper.js";
import { handleHandleOnMouseMove, handleUnderMouseCursor } from "./AppHandlers.js";

import { Composition } from "../Composition/Composition.js";

import { UI } from "../UI/UI.js";
import { UINodeParamList } from "../UI/Node/UINodeParamList.js";
import { UINodeParam } from "../UI/Node/UINodeParam.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { Effector } from "../UI/Node/Effector.js";

import { ComponentNode } from "../UI/Node/ComponentNode.js";

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
    clickOffset = undefined;
    mouseX = 0;
    mouseY = 0;

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
        const mainComp = this.addNewComposition("Main comp", this.UI.viewport);

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
        // obj1.setRotation(0.4);

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
        const compNode = new ComponentNode(this, [500, 300], [0.1,0.1,0.1,1], "myComponent");
        compNode.addParamNode("IN", paramList);
        compNode.addFunctionNode(effectorFunction);
        compNode.addParamNode("OUT", paramList);

        // this.UI.addObj(compNode.getObjsToRender(), ["nodes"]);
        compNode.setPosition([500,500]);

        // Finally can update UI fully
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

    drawFrame()
    {
        // Resize canvas to display
        resizeCanvas(this);

        const UIList = 0;
        const activeCompList = 1;

        const pickingShader = 1;
        const objShader = undefined;

        // Draw to texture - PASS 1
        prepareForFirstPass(this.gl, this.framebuffer);
        this.drawUI(UIList, pickingShader);
        this.drawComp(activeCompList, pickingShader);

        this.handleEvents();

        // 2nd Pass - Draw "normally"
        prepareForScndPass(this.gl);
        // passing undefined program so each object uses its own shader
        this.drawUI(UIList, objShader);
        this.drawComp(activeCompList, objShader);

        resetMouseClick(this);
    }

    createDrawList()
    {
        // need to:
        // 1. calc world matrices for each object
        // 2. render via tree traversal

        const viewerObjs = this.retrieveRenderObjs(this.UI.viewer);
        const activeCompObjs = this.retrieveRenderObjs(this.activeComp.viewport);

        this.objsToDraw = [
            { mask: [ this.UI.viewer.container ], objs: [ ...viewerObjs ] },
            // { mask: [], objs: UI.panels.layers.objects },
            { mask: [ this.UI.viewport.container ], objs: [ ...activeCompObjs] },
        ];
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

    handleEvents()
    {
        // Look up id of the object under mouse cursor
        const underMouseObjId = getIdFromCurrentPixel(this.gl, this.mouseX, this.mouseY);
        
        handleUnderMouseCursor(this, underMouseObjId);

        // Handle move comp object
        if ( canMoveObj(this) )
        {
            moveObjectWithCoursor(this);
        }

        // Handle UI Node handles events
        handleHandleOnMouseMove(this);
    }

    addNewComposition(compName, viewport)
    {
        const newComp = new Composition(this, compName, viewport);
        this.comps.push(newComp);
        this.setActiveComp(newComp);

        return newComp;
    }

    retrieveRenderObjs(section)
    {
        const objsToDraw = [];
        this.addObjToDrawList(section.container, objsToDraw);
        return objsToDraw;
    }

    setActiveComp(comp)
    {
        if (comp && comp instanceof Composition) this.activeComp = comp;
        else console.log("Trying to set incorrect composition as active!");
    }

    removeObjsFromScene(objs)
    {
        // UNOPTIMIZED, implement hash set later on!
        objs.forEach( (obj) => {
            this.objsToDraw = this.objsToDraw.filter( objToDraw => objToDraw.id !== obj.id );
        })
    }

    addObjToDrawList(obj, drawList)
    {
        if (!obj || !(obj.children)) return;
        if (!(obj instanceof RenderableObject)) throw new Error("Incorrect object pushed to draw list!");

        drawList.push(obj);
        for (let i = 0; i < obj.children.length; i++)
        {
            this.addObjToDrawList(obj.children[i],drawList);
        }
    }
}