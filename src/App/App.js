import { RenderableObject } from "../RenderableObject.js";
import { initalizeApp } from "./initializeApp.js";
import { initInputListeners } from "./initializeApp.js";
import { prepareForFirstPass, prepareForScndPass, retrieveRenderObjs, addNewComposition, resetMouseClick, resizeCanvas } from "./AppHelper.js";
import { drawPass } from "./AppDraw.js";

import { handleEvents } from "./AppHandlers.js";

import { UI } from "../UI/UI.js";
import { UINodeParamList } from "../UI/NodeEditor/UINodeParamList.js";
import { UINodeParam } from "../UI/NodeEditor/UINodeParam.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { Effector } from "../UI/NodeEditor/Effector.js";
import { Component } from "../UI/NodeEditor/Component.js";

import { procc } from "../animation/animation_operations.js";

import { RoundedRectangleBuffer } from "../Primitives/RoundedRectangleBuffer.js";

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

    prevMouseX = 0;
    prevMouseY = 0;

    // to do
    state = {
        activeObj:
        {
            id: 0,
            arrIndx: 0
        },
        prevActiveObj:
        {
            id:0,
            arrIndx: 0
        },
        objIDToDrag:
        {
            id: 0,
            arrIndx: 0
        },
        input:
        {
            keyboard:
            {
                keyPressed: [],
            },
            mouse:
            {
                position:
                {
                    x: 0,
                    y: 0
                },
                prevPosition:
                {
                    x: 0,
                    y: 0
                },
                isMouseDown: false,
                isMouseClicked: false,
                isMouseClickedTwice: false,
                clickOffset: 0
            }
        }
    }

    inputState = {
        keyPressed: [],
    }

    settings = {
        render:
        {
            blendingEnabled: false
        }
    }

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

    // eventsToProcess = [];

    animationCounter = 0;

    shouldAnimate = false;
    animationTimer = 0.;

    lastTime = 0.;

    drawCalls = 0;

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

    changeEffectorFunction(appRef, value)
    {
        const activeObj = appRef.objsToDraw[this.activeObjArrIndx].objs[this.activeObjID];

        if (activeObj.effector)
        {
            console.log("CHANGING EFFECTOR!");
            activeObj.effector.fnc = eval(value);
        } else console.log("NO EFFECTOR");

    }

    start()
    {
        // Set up primitve buffers, font etc.
        initalizeApp(this);

        // Create DOM UI
        // (temporary dirty solution)
        const body = document.getElementById("mainWindow");
        const input = document.createElement("textarea");
        const layers = document.createElement("div");

        const startButton = document.createElement("button");
        startButton.textContent = "Start animation";
        startButton.onclick = () => this.startAnimation();

        input.setAttribute("type", "text");
        input.id = "functionText";
        input.addEventListener("change", () => {
            console.log(input.value);
            this.changeEffectorFunction(this, input.value);
        });

        layers.id = "layersPanel";

        body.appendChild(input);
        body.appendChild(layers);

        body.appendChild(startButton);

        // Create UI
        this.UI = new UI(this);

        // Create main comp and set it as active
        const mainComp = addNewComposition(this, "Main comp", this.UI.viewport);

        // Background
        const solidBuffer = new RectangleBuffer(this.gl, this.programs[0], [this.activeComp.viewport.width, this.activeComp.viewport.height]);
        const solid = new RenderableObject(solidBuffer);
        solid.name = "solid";

        solid.setPosition([0,0]);
        solid.setCanBeMoved(false);
        solid.setCanBeHighlighted(false);
        solid.setOriginalColor([0.97,0.97,0.97,1]);

        const obj1 = new RenderableObject(this.primitiveBuffers.circle);
        obj1.setPosition([0,0]);
        obj1.setScale([1,1]);
        obj1.name = "myCircle";

        const obj2 = new RenderableObject(this.primitiveBuffers.circle);
        obj2.setPosition([100,0]);
        obj2.setScale([0.5,1]);
        obj2.name = "circle2";

        const obj3 = new RenderableObject(this.primitiveBuffers.rectangle);
        obj3.setPosition([200, 0]);
        obj3.setScale([1,1]);
        obj3.name = "rect";

        const obj4 = new RenderableObject(this.primitiveBuffers.circle);
        obj4.setPosition([300, 0]);
        obj4.name = "circle4";

        obj4.setParent(obj3);
        obj3.setParent(obj2);
        obj2.setParent(obj1);

        console.log(this.programs);
        const roundedRectBuff = new RoundedRectangleBuffer(this.gl, this.programs[5]);
        const roundedRect = new RenderableObject(roundedRectBuff);
        roundedRect.properties.resolution = [this.gl.canvas.width,this.gl.canvas.height];

        console.log(roundedRect);

        roundedRect.setPosition([500,500]);
        roundedRect.setScale([4,3.5]);

        this.activeComp.addObj([solid, obj1,obj2,obj3, obj4, roundedRect ]);

        const paramList = new UINodeParamList([
            new UINodeParam("position", "TEXT_READ", [0,0]),
            new UINodeParam("scale", "TEXT_READ", [1,1])
        ]);

        const paramList2 = new UINodeParamList([
            new UINodeParam("position", "TEXT_READ", [0,0]),
            new UINodeParam("scale", "TEXT_READ", [1,1])
        ]);

        const paramListOUT = new UINodeParamList([
            new UINodeParam("position", "TEXT_READ", [0,0]),
            new UINodeParam("scale", "TEXT_READ", [1,1])
        ]);

        const paramListOUT2 = new UINodeParamList([
            new UINodeParam("position", "TEXT_READ", [0,0]),
            new UINodeParam("scale", "TEXT_READ", [1,1])
        ]);

        const paramListFNC = new UINodeParamList([
            new UINodeParam("position", "TEXT_READ", [0,0]),
            new UINodeParam("scale", "TEXT_READ", [1,1])
        ]);


        // Render Obj Nodes

        /*
        this.activeComp.objects.forEach( (obj) => {
            const newObjNode = this.UI.addObjNode(obj);
            newObjNode.setPosition([300,550]);
        })
        */

        for (let i = 0; i < this.activeComp.objects-1; i++)
        {
            const obj = this.activeComp.objects[i];
            const newObjNode = this.UI.addObjNode(obj);
            newObjNode.setPosition([300,550]);
        }


        const fnc = () => console.log("Hello, this is some function!");
        const effectorFunction = new Effector("Custom function", fnc, 3, 2);
        const componentBuff = this.primitiveBuffers.rectangle;
        const compNode = new Component(this, componentBuff,  [500, 300], [0.1,0.1,0.1,1], "myComponent");
        compNode.addParamNode("IN", paramList);
        compNode.addParamNode("IN", paramList);
        compNode.addFunctionNode(effectorFunction);
        compNode.addParamNode("OUT", paramListOUT);
        compNode.addParamNode("OUT", paramListOUT);
        
        const fnc2 = () => console.log("Another function!");
        const effectorFunction2 = new Effector("Custom function2", fnc2, 3, 2)
        const compNode2 = new Component(this, componentBuff, [600, 300], [0.1,0.1,0.1,1], "myComponent2");
        compNode2.addParamNode("IN", paramList2);
        compNode2.addParamNode("IN", paramList2);
        compNode2.addFunctionNode(effectorFunction2);
        compNode2.addParamNode("OUT", paramListOUT2);
        compNode2.addParamNode("OUT", paramListOUT2);

        console.log(compNode2);

        
        /*
        const compNode3 = new Component(this, componentBuff, [600, 300], [0.1,0.1,0.1,1], "myComponent3");
        compNode3.addParamNode("IN", paramList);
        compNode3.addFunctionNode(effectorFunction2);
        compNode3.addParamNode("OUT", paramListOUT);

        const compNode4 = new Component(this, componentBuff, [600, 300], [0.1,0.1,0.1,1], "myComponent4");
        compNode4.addParamNode("IN", paramList);
        compNode4.addFunctionNode(effectorFunction2);
        compNode4.addParamNode("OUT", paramListOUT);
        */

        const activeViewer = this.UI.viewer;
        activeViewer.addComponent(compNode);
        activeViewer.addComponent(compNode2);
        // activeViewer.addComponent(compNode3);
        // activeViewer.addComponent(compNode4);

        // this.UI.addObj(compNode.getObjsToRender(), ["nodes"]);
        compNode.setPosition([500,500]);
        compNode2.setPosition([500,400]);
        // compNode3.setPosition([300,400]);
        // compNode4.setPosition([100,400]);
    }

    // render loop function called from RenderLoop class
    doFrame(elapsedTime, fps)
    {
        // convert elapsed time in ms to s
        this.lastTime = this.time;
        this.time = elapsedTime * 0.001;
        this.fps = fps;

        // calculate world matrices for all objects
        // this.UI.viewer.container.children.forEach( (obj) => obj.updateWorldMatrix() );

        // Gather objs to draw
        // this.constructLayersPanel(this.activeComp.viewport);

        if (this.shouldAnimate) this.processAnimationFrame(elapsedTime);
        this.createDrawList(this.UI, this.activeComp.objects);
        this.drawFrame();
    }

    processAnimationFrame(elapsedTime)
    {
        // update animation timer
        const timeBetweenFrames = this.time - this.lastTime;
        this.animationTimer += timeBetweenFrames;

        procc(this.animationTimer, this.UI.viewer);
    }

    startAnimation()
    {
        this.animationTimer = 0.;
        this.shouldAnimate = true;
    }

    createDrawList()
    {
        // need to:
        // 1. calc world matrices for each object
        // 2. render via tree traversal

        const viewerObjs = retrieveRenderObjs(this.UI.viewer);
        const activeCompObjs = retrieveRenderObjs(this.activeComp.viewport);

        this.objsToDraw = [
            { mask: [ this.UI.viewer ], objs: [ ...viewerObjs ] },
            { mask: [ this.activeComp.viewport ], objs: [ ...activeCompObjs] },
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
        prepareForFirstPass(this, this.framebuffer, [this.mouseX, this.mouseY]);
        this.drawUI(UIList, pickingShader, this.UI.viewer.camera );
        this.drawComp(activeCompList, pickingShader, this.activeComp.camera);

        handleEvents(this);

        // 2nd Pass - Draw "normally"
        prepareForScndPass(this.gl);
        // passing undefined program so each object uses its own shader
        this.drawUI(UIList, objShader, this.UI.viewer.camera);
        this.drawComp(activeCompList, objShader, this.activeComp.camera);

        resetMouseClick(this);
    }

    drawUI(listToUse, programIndx, camera)
    {
        const renderSettings = {
            appRef: this,
            objsToDraw: [ this.objsToDraw[listToUse] ],
            program: this.programs[programIndx],
            listIndx: listToUse,
            camera: camera
        }

        drawPass(renderSettings);
    }

    drawComp(listToUse, programIndx, camera = this.activeComp.camera)
    {
        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);

        const renderSettings = {
            appRef: this,
            objsToDraw: [ this.objsToDraw[listToUse] ],
            program: this.programs[programIndx],
            listIndx: listToUse,
            camera: camera
        }

        drawPass(renderSettings);
    }

    setBlendingEnabled(isEnable)
    {
        if (typeof isEnable !== "boolean") throw new Error("Incorrect type!");

        if (isEnable)
        {
            this.gl.enable(this.gl.BLEND);
        } else {

            this.gl.disable(this.gl.BLEND);
        }

        this.settings.render.blendingEnabled = isEnable;

        return this.settings.render.blendingEnabled;
    }
}