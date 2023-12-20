import { RenderableObject } from "../RenderableObject.js";
import { initalizeApp } from "./initializeApp.js";
import { prepareForFirstPass, prepareForScndPass, retrieveRenderObjs, addNewComposition, resetMouseClick, resizeCanvas } from "./AppHelper.js";
import { drawPass } from "./AppDraw.js";

import { handleEvents } from "./AppEvents.js";

import { UI } from "../UI/UI.js";
import { UINodeParam } from "../UI/NodeEditor/UINodeParam.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { Effector } from "../UI/NodeEditor/Effector.js";
import { Component } from "../UI/NodeEditor/Component.js";

import { procc } from "../animation/animation_operations.js";

import { InputManager } from "./InputManager.js";
import { SceneManager } from "./SceneManager.js";

export class App
{
    // Reference to WebGl and HTML objects
    gl = {};
    programs = [];
    document = {};

    time = 0.;
    fps = 0.;

    // App managers
    sceneManager;
    inputManager;

    primitiveBuffers = undefined;

    framebuffer = {};
    depthBuffer = {};
    renderTexture = {};

    settings = {
        render:
        {
            blendingEnabled: false
        }
    }

    comps = [];

    UI;
    fontUI = undefined;

    animationCounter = 0;
    shouldAnimate = false;
    animationTimer = 0.;
    lastTime = 0.;
    drawCalls = 0;

    constructor(gl, programsInfo, framebuffer, depthBuffer, renderTexture)
    {

        // save gl for local use
        this.gl = gl;
        this.ext = this.gl.getExtension('GMAN_webgl_memory');
        this.document = gl.canvas.parentNode;
        this.programs = programsInfo;

        this.framebuffer = framebuffer;
        this.depthBuffer = depthBuffer;
        this.renderTexture = renderTexture;

        // Create managers for the app
        this.sceneManager = new SceneManager();
        this.inputManager = new InputManager(gl.canvas, this.document);

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
        this.sceneManager.setActiveCamera(mainComp);

        // Background
        const activeComp = this.sceneManager.getActiveComp();
        const solidBuffer = new RectangleBuffer(this.gl, this.programs[0], [activeComp.viewportRef.width, activeComp.viewportRef.height]);
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

        activeComp.addMultipleObjs([solid, obj1]);

        const simParams = [
            new UINodeParam("position", "TEXT_READ", [0,0]),
            new UINodeParam("scale", "TEXT_READ", [0,0]),
        ];

        const simParamsOUT = [
            new UINodeParam("position", "TEXT_READ", [0,0]),
            new UINodeParam("scale", "TEXT_READ", [0,0]),
        ];


        
        const sobj = activeComp.objects[1];
        const newObjNode = this.UI.addObjNode(sobj);
        newObjNode.setPosition([500,550]);

        const fnc = (in1) => { return [[100,500]]; };
        const effectorFunction = new Effector("Custom function", fnc, 2, 2);
        const componentBuff = this.primitiveBuffers.roundedRectangle;
        const compNode = new Component(this, componentBuff, 5.0 , "Somesa");
        compNode.addParamNode("IN", simParams);
        compNode.addFunctionNode(effectorFunction);
        compNode.addParamNode("OUT", simParamsOUT);
        
        const fnc2 = () => console.log("Another function!");
        const effectorFunction2 = new Effector("Custom function2", fnc2, 3, 2)
        const compNode2 = new Component(this, componentBuff, 3.0, "myComponent2");
        compNode2.addParamNode("IN", simParams);
        compNode2.addFunctionNode(effectorFunction2);
        compNode2.addParamNode("OUT", simParamsOUT);

        const fnc3 = () => console.log("Another function!");
        const effectorFunction3 = new Effector("Custom function2", fnc3, 3, 2)
        const compNode3 = new Component(this, componentBuff, 5.0, "myComponent3");
        compNode3.addParamNode("IN", simParams);
        compNode3.addFunctionNode(effectorFunction3);
        compNode3.addParamNode("OUT", simParamsOUT);

        const activeViewer = this.UI.viewer;
        activeViewer.addComponent(compNode);
        activeViewer.addComponent(compNode2);
        activeViewer.addComponent(compNode3);

        compNode.setPosition([500,900]);
    }

    // render loop function called from RenderLoop class
    doFrame(elapsedTime, fps)
    {
        // convert elapsed time in ms to s
        this.lastTime = this.time;
        this.time = elapsedTime * 0.001;
        this.fps = fps;

        if (this.shouldAnimate) this.processAnimationFrame(elapsedTime);
        this.createDrawList(this.UI.viewer, this.sceneManager.getActiveComp());
        this.drawFrame();
    }

    processAnimationFrame(elapsedTime)
    {
        // update animation timer
        const timeBetweenFrames = this.time - this.lastTime;
        this.animationTimer += timeBetweenFrames;

        try
        {
        procc(this.animationTimer, this.UI.viewer);
    } catch(error)
    {
        this.stopAnimation();
        console.error(error);
    }
    
    }

    startAnimation()
    {
        this.animationTimer = 0.;
        this.shouldAnimate = true;
    }

    stopAnimation()
    {
        console.log("Stoping animation, time: " + this.animationTimer);
        this.shouldAnimate = false;
    }

    createDrawList(UI, activeComp)
    {
        // need to:
        // 1. calc world matrices for each object
        // 2. render via tree traversal

        const viewerObjs = retrieveRenderObjs(UI);
        const activeCompObjs = retrieveRenderObjs(activeComp.viewportRef);

        const objsToDraw = [
            { mask: [ this.UI.viewer ], objs: [ ...viewerObjs ] },
            { mask: [ this.UI.viewport ], objs: [ ...activeCompObjs] },
        ];

        this.sceneManager.setObjsToDraw(objsToDraw);
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
        const mousePos = [ this.inputManager.getMouseX(), this.inputManager.getMouseY() ];
        prepareForFirstPass(this, this.framebuffer, mousePos);
        this.drawUI(UIList, pickingShader, this.UI.viewer.camera );
        this.drawComp(activeCompList, pickingShader, this.activeComp.camera);

        handleEvents(this.gl, this.document.style, this.UI, this.inputManager, this.sceneManager);

        
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
            objsToDraw: [ this.sceneManager.getObjsToDraw()[listToUse] ],
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
            objsToDraw: [ this.sceneManager.getObjsToDraw()[listToUse] ],
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