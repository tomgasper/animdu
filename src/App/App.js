import { m3  } from "../utils.js"
import { UINode } from "../UI/Node/UINode.js";
import { RenderableObject } from "../RenderableObject.js";
import { getIdFromCurrentPixel, setFramebufferAttachmentSizes } from "../pickingFramebuffer.js";
import { initalizeApp } from "./initializeApp.js";
import { initInputListeners } from "./initializeApp.js";
import { initUI } from "../UI/initializeUI.js";
import { prepareForFirstPass, prepareForScndPass, drawObjects, canMoveObj, moveObjectWithCoursor, resetMouseClick, resizeCanvas } from "./AppHelper.js";
import { handleHandleOnMouseMove, handleUnderMouseCursor } from "./AppHandlers.js";

import { Composition } from "../Composition/Composition.js";

import { UI } from "../UI/UI.js";
import { UINodeParamList } from "../UI/Node/UINodeParamList.js";
import { UINodeParam } from "../UI/Node/UINodeParam.js";

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
    prevActiveObjID = -1;
    objectIDtoDrag = -1;
    objUnderMouseID = -1;

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
        // Calculate projection matrix for scene objects
        const projectionMat = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        // Set up primitve buffers, font etc.
        initalizeApp(this);

        // Create UI
        this.UI = new UI(this);

        // Create main comp and set it as active
        this.addNewComposition("Main comp");

        const obj1 = new RenderableObject(this.primitiveBuffers.circle, projectionMat);
        obj1.setPosition([150,250]);
        obj1.setScale([1,1]);

        const obj2 = new RenderableObject(this.primitiveBuffers.triangle, projectionMat);
        obj2.setPosition([150,0]);
        obj2.setRotation(0);

        const obj3 = new RenderableObject(this.primitiveBuffers.rectangle, projectionMat);
        obj3.setPosition([150,0]);
        obj3.setScale([1,1]);

        obj3.setParent(obj2);
        obj2.setParent(obj1);
        obj1.updateWorldMatrix();

        this.activeComp.addObj([obj1,obj2,obj3]);

        const myParamList = new UINodeParamList([
            new UINodeParam("Param1"),
            new UINodeParam("Param2"),
            new UINodeParam("Param3")
        ]);

        const myParamList2 = new UINodeParamList([
            new UINodeParam("Param1"),
            new UINodeParam("Param2"),
            new UINodeParam("Param3")
        ]);

        console.log(myParamList);

        this.UI.addNode(myParamList);
        // this.UI.addNode(myParamList2);


        const myParamList3 = new UINodeParamList([
            new UINodeParam("Speed"),
            new UINodeParam("Acc"),
            new UINodeParam("Position")
        ]);
        

        //this.UI.addNode(myParamList3);
    }

    doFrame(elapsedTime, fps)
    {
        // convert elapsed time in ms to s
        this.time = elapsedTime * 0.001;
        this.fps = fps;

        // Gather objs to draw
        this.createDrawList(this.UI.objects, this.activeComp.objects);
        this.drawFrame();
    }

    drawFrame()
    {
        // Resize canvas to display
        resizeCanvas(this);

        // Draw to texture - PASS 1
        prepareForFirstPass(this.gl, this.framebuffer);
        drawObjects(this, this.objsToDraw, this.programs[1]);

        this.handleEvents();

        // 2nd Pass - Draw "normally"
        prepareForScndPass(this.gl);
        drawObjects(this, this.objsToDraw);

        resetMouseClick(this);
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

    addNewComposition(compName)
    {
        const newComp = new Composition(this, compName);
        this.comps.push(newComp);
        this.setActiveComp(newComp);

        return newComp;
    }

    createDrawList(UIObjs, activeCompObjs)
    {
        this.objsToDraw = [...UIObjs, ...activeCompObjs];
    }

    setActiveComp(comp)
    {
        if (comp && comp instanceof Composition) this.activeComp = comp;
        else console.log("Trying to set incorrect composition as active!");
    }

    addObjToScene(objs)
    {
        // Appropriate checks for valid obj
        objs.forEach((obj) => {
            if (obj) { this.objsToDraw.push(obj); }  
        })
    }

    removeObjsFromScene(objs)
    {
        // UNOPTIMIZED, implement hash set later on!
        objs.forEach( (obj) => {
            this.objsToDraw = this.objsToDraw.filter( objToDraw => objToDraw.id !== obj.id );
        })
    }

    getSceneObjs() {
        return this.objsToDraw;
    }
}