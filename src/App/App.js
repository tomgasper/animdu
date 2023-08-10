import { m3  } from "../utils.js"
import { UINode } from "../UI/Node/UINode.js";
import { RenderableObject } from "../RenderableObject.js";
import { getIdFromCurrentPixel, setFramebufferAttachmentSizes } from "../pickingFramebuffer.js";
import { initalizeApp } from "./initializeApp.js";
import { initInputListeners } from "./initializeApp.js";
import { prepareForFirstPass, prepareForScndPass, drawObjects, canMoveObj, moveObjectWithCoursor, resetMouseClick, resizeCanvas } from "./AppHelper.js";
import { handleHandleOnMouseMove, handleUnderMouseCursor } from "./AppHandlers.js";

import { Composition } from "../Composition/Composition.js";

import { UI } from "../UI/UI.js";
import { UINodeParamList } from "../UI/Node/UINodeParamList.js";
import { UINodeParam } from "../UI/Node/UINodeParam.js";
import { CustomBuffer } from "../Primitives/CustomBuffer.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

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
        // Calculate projection matrix for scene objects
        const projectionMat = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        // Set up primitve buffers, font etc.
        initalizeApp(this);

        // Create UI
        this.UI = new UI(this);

        // Create main comp and set it as active
        const mainComp = this.addNewComposition("Main comp", this.UI.viewport);

        const solidBuffer = new RectangleBuffer(this.gl, this.programs[0], [this.activeComp.viewport.width, this.activeComp.viewport.height]);
        const solid = new RenderableObject(solidBuffer.getInfo());

        solid.setPosition([0,0]);
        solid.setCanBeMoved(false);
        solid.setCanBeHighlighted(false);
        solid.setOriginalColor([0.97,0.97,0.97,1]);

        const obj1 = new RenderableObject(this.primitiveBuffers.circle, projectionMat);
        obj1.setPosition([0,0]);
        obj1.setScale([1,1]);

        const obj2 = new RenderableObject(this.primitiveBuffers.circle, projectionMat);
        obj2.setPosition([100,0]);

        const obj3 = new RenderableObject(this.primitiveBuffers.circle, projectionMat);
        obj3.setPosition([100,100]);
        obj3.setScale([1,1]);

        const obj4 = new RenderableObject(this.primitiveBuffers.circle, projectionMat);
        obj4.setPosition([0, 100]);

        obj4.setParent(obj3);
        obj3.setParent(obj2);
        obj2.setParent(obj1);
        obj1.updateWorldMatrix();

        this.activeComp.addObj([solid, obj1,obj2,obj3, obj4]);

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

        const node = this.UI.addNode(myParamList);
        node.setPosition([300,400]);

        const node2 = this.UI.addNode(myParamList2);
        node2.setPosition([200,500]);


        const myParamList3 = new UINodeParamList([
            new UINodeParam("Speed"),
            new UINodeParam("Acc"),
            new UINodeParam("Position")
        ]);
        

        // Finally can update UI fully
        this.UI.initLayersPanel(this);
    }

    doFrame(elapsedTime, fps)
    {
        // convert elapsed time in ms to s
        this.time = elapsedTime * 0.001;
        this.fps = fps;

        // Gather objs to draw
        this.createDrawList(this.UI, this.activeComp.objects);
        this.drawFrame();
    }

    drawFrame()
    {
        // Resize canvas to display
        resizeCanvas(this);

        // Draw to texture - PASS 1
        prepareForFirstPass(this.gl, this.framebuffer);
        this.drawPass(this.objsToDraw.slice(0,2), this.programs[1]);

        // this.gl.viewport(650,-150, this.gl.canvas.width, this.gl.canvas.height);
        this.drawPass([this.objsToDraw[2]], this.programs[1], 2);

        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);
        this.handleEvents();

        // 2nd Pass - Draw "normally"
        prepareForScndPass(this.gl);
        // passing undefined program so each object uses its own shader
        this.drawPass(this.objsToDraw.slice(0,2), undefined);

        // this.gl.viewport(650,-150, this.gl.canvas.width, this.gl.canvas.height);
        this.drawPass([this.objsToDraw[2]], undefined, 2);

        this.gl.disable(this.gl.STENCIL_TEST);

        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);

        resetMouseClick(this);
    }

    drawInMask(i, program)
    {
        this.gl.enable(this.gl.STENCIL_TEST);
        this.gl.clear(this.gl.STENCIL_BUFFER_BIT);
        this.gl.stencilFunc(this.gl.ALWAYS,1,0xFF);
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);

        drawObjects(this, this.objsToDraw[i].mask, i, program);

        this.gl.stencilFunc(this.gl.EQUAL, 1, 0xFF);
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
        drawObjects(this, this.objsToDraw[i].objs, i, program);

        this.gl.disable(this.gl.STENCIL_TEST);
    }

    drawWithoutMask(i, program = undefined)
    {
        drawObjects(this, this.objsToDraw[i].objs, i, program);
    }

    drawPass(objsToDraw, program, indx = 0)
    {
        for (let i = 0; i < objsToDraw.length; i++)
        {
            if (objsToDraw[i].mask.length > 0)
            {
                this.drawInMask(indx, program);
            }
            else
            {
                this.drawWithoutMask(indx, program);
            }
            indx++;
        }
    }

    handleEvents()
    {
        // Look up id of the object under mouse cursor
        const underMouseObjId = getIdFromCurrentPixel(this.gl, this.mouseX, this.mouseY);
        // console.log(underMouseObjId);
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

    createDrawList(UI, activeCompObjs)
    {
        this.objsToDraw = [
            { mask: [ ...UI.viewer.objects ], objs: [...UI.viewer.objects, ...UI.nodes.objects ] },
            { mask: [], objs: UI.panels.layers.objects },
            { mask: UI.viewport.objects, objs: [ ...UI.viewport.objects, ...activeCompObjs] },
        ];
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