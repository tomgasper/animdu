import { m3  } from "../utils.js"
import { UINode } from "../UI/UINode.js";
import { RenderableObject } from "../RenderableObject.js";
import { getIdFromCurrentPixel, setFramebufferAttachmentSizes } from "../pickingFramebuffer.js";
import { initalizeApp } from "./initializeApp.js";
import { initInputListeners } from "./initializeApp.js";
import { initUI } from "../UI/initializeUI.js";
import { prepareForFirstPass, prepareForScndPass, drawObjects, canMoveObj, moveObjectWithCoursor, resetMouseClick, resizeCanvas } from "./AppHelper.js";
import { handleHandleOnMouseMove, handleUnderMouseCursor } from "./AppHandlers.js";


export class App
{
    gl = {};
    programs = [];
    canvas = {};
    document = {};

    time = 0.;
    fps = 0.;

    primitiveBuffers = undefined;
    UIBuffers = undefined;

    objsToDraw = [];

    framebuffer = {};
    depthBuffer = {};
    renderTexture = {};

    isMouseDown = false;
    isMouseClicked = false;
    clickOffset = undefined;
    mouseX = 0;
    mouseY = 0;

    activeObjID = -1;
    prevActiveObjID = -1;
    objectIDtoDrag = -1;
    objUnderMouseID = -1;

    eventsToProcess = [];

    fontUI = undefined;

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

        // Set up buffers for UI elements,
        initUI(this);

        // !!! Should create comp here !!! 

        const obj1 = new RenderableObject(this.primitiveBuffers.circle, projectionMat);
        obj1.setPosition([150,250]);
        obj1.setScale([1,1]);

        const obj2 = new RenderableObject(this.primitiveBuffers.triangle, projectionMat);
        obj2.setPosition([150,0]);
        obj2.setRotation(0);

        const obj3 = new RenderableObject(this.primitiveBuffers.rectangle, projectionMat);
        obj3.setPosition([150,0]);
        obj3.setScale([1,1]);

        const node1 = new UINode(this);
        const node2 = new UINode(this);
        const node3 = new UINode(this);
        const node4 = new UINode(this);
        node2.setPosition([250,0]);
        node3.setPosition([0,250]);
        node4.setPosition([250,250]);

        obj3.setParent(obj2);
        obj2.setParent(obj1);
        obj1.updateWorldMatrix();

        // Add all objs
        this.addObjToScene([obj1,obj2,obj3]);
        this.addObjToScene(node1.getObjsToRender());
        this.addObjToScene(node2.getObjsToRender());
        this.addObjToScene(node3.getObjsToRender());
        this.addObjToScene(node4.getObjsToRender());

        console.log(this.objsToDraw);
    }

    doFrame(elapsedTime, fps)
    {
        // convert elapsed time in ms to s
        this.time = elapsedTime * 0.001;
        this.fps = fps;

        // Draw frame
        this.drawFrame();
    }

    drawFrame()
    {
        // Resize canvas to display
        resizeCanvas(this);

        // Draw to texture - PASS 1
        prepareForFirstPass(this.gl, this.framebuffer);
        drawObjects(this, this.objsToDraw, this.programs[1]);
        
        // Look up id of the object under mouse cursor
        const id = getIdFromCurrentPixel(this.gl, this.mouseX, this.mouseY);
        handleUnderMouseCursor(this, id);

        // Handle move comp object
        if ( canMoveObj(this) )
        {
            moveObjectWithCoursor(this);
        }

        // Handle UI Node handles events
        handleHandleOnMouseMove(this);

        // 2nd Pass - Draw "normally"
        prepareForScndPass(this.gl);
        drawObjects(this, this.objsToDraw);

        resetMouseClick(this);
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