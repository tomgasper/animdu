import { m3, resizeCanvasToDisplaySize, renderObject, prepareForRender, getProjectionMat  } from "./utils.js"

import { TriangleBuffer } from "./Primitives/TriangleBuffer.js";
import { CircleBuffer } from "./Primitives/CircleBuffer.js";
import { RectangleBuffer } from "./Primitives/RectangleBuffer.js";
import { CustomBuffer } from "./Primitives/CustomBuffer.js";

import { UINode } from "./UI/UINode.js";

import { RenderableObject } from "./Primitives/RenderableObject.js";

import { getIdFromCurrentPixel, setFramebufferAttachmentSizes } from "./pickingFramebuffer.js";
import { TextFont } from "./Text/TextFont.js";

import { roboto_bold_font } from "./fonts/roboto-bold.js";

import { mountUI } from "./UI/helper_UI.js";
import { resetMousePointer } from "./sceneHelper.js";

import { InstancedLineBuffer } from "./Primitives/InstancedLineBuffer.js";
import { InstancedLineCapBuffer } from "./Primitives/InstancedLineCapsBuffer.js";


export class SceneManager
{
    gl = {};
    programs = [];
    canvas = {};
    document = {};

    time = 0.;
    fps = 0.;

    // temp
    editableText = {};

    primitiveBuffers = {};

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

        // Add event listeners for user input
        this.gl.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
         });

         this.document.addEventListener("keyup", (e) => {
        });

        this.document.addEventListener("keydown", (e) => {
            if (this.activeObjID >= 0 && this.objsToDraw[this.activeObjID].handlers.onInputKey)
            {
                let currObj = this.objsToDraw[this.activeObjID].handlers;
                
                currObj.onInputKey.call(currObj,e);
            }

        });

         this.gl.canvas.addEventListener("mousedown", (e) => {
            if (this.isMouseDown === false) {
                this.isMouseDown = true;
            }
         });

         this.gl.canvas.addEventListener("click", (e) => {
            this.isMouseClicked = true;
         })

         this.gl.canvas.addEventListener("mouseup", (e) => {
            this.isMouseDown = false;

            if (this.objectIDtoDrag >= 0 && this.objsToDraw[this.objectIDtoDrag].handlers.onMouseUp)
            {
                let currObj = this.objsToDraw[this.objectIDtoDrag].handlers;
                currObj.onMouseUp.call(currObj, this.objUnderMouseID);
            }

            this.objectIDtoDrag = -1;
         })
    }

    setUpScene()
    {
        // Calculate projection matrix for scene objects
        const projectionMat = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        // Install font
        const fontSettings = {
            textureSrc: "./src/fonts/roboto-bold.png",
            texResolution: [1024,1024],
            color: [1,1,1.3,1],
            subpixel: 1.0,
            decoder: roboto_bold_font
        };
        const robotoBoldFont = new TextFont(this.gl, fontSettings, this.gl.LUMINANCE);
        this.fontUI = robotoBoldFont;

        mountUI(this);

        // Describe buffers for primitive shape
        const triangleBuffer = new TriangleBuffer(this.gl, this.programs[0]);
        const circleBuffer = new CircleBuffer(this.gl,this.programs[0], 50, 8);
        const rectangleBuffer = new RectangleBuffer(this.gl,this.programs[0]);    

        this.primitiveBuffers = {
            rectangle: rectangleBuffer.getInfo(),
            circle: circleBuffer.getInfo(),
            triangle: triangleBuffer.getInfo()
        };

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

        const lineWidth = 5;
        const lineData = [0,0,
                        150, 150,
                        50, 30,
                        120, 31,
                        33, 0,
                        502, 123 ];

        
        // Make it more tidy
        // const myLineCapsBuffer = new InstancedLineCapBuffer(this.gl, this.programs[4], lineData);
        // const myLineCaps = new RenderableObject(myLineCapsBuffer.getInfo(), getProjectionMat(this.gl));

        // const myLineBuffer = new InstancedLineBuffer(this.gl, this.programs[3], lineData, true);
        // const myLine = new RenderableObject(myLineBuffer.getInfo(), getProjectionMat(this.gl));

        // myLine.properties.width = lineWidth;
        // myLineCaps.properties.width = lineWidth;

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

    addObjToScene(objs)
    {
        // Appropriate checks for valid obj
        objs.forEach((obj) => {
            if (obj) { this.objsToDraw.push(obj); }  
        })
    }

    getSceneObjs() {
        return this.objsToDraw;
    }

    drawObjects(objsToDraw, programInfo = undefined)
    {
        // to do
        let program;
        const projection = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        if (typeof programInfo !== "undefined" ) // Use object's shader when shader hasn't been specified
        {
            program = programInfo;

            this.gl.useProgram(program.program);

            // set projection based on canvas dimensions

            objsToDraw.forEach((obj, i) => {
                // (!) Notice that we are setting id offset by 1
                const ii = i +1 ;

                // if object is pickable then assign it a u_id
                const u_id = [
                        ((ii >>  0) & 0xFF) / 0xFF,
                        ((ii >>  8) & 0xFF) / 0xFF,
                        ((ii >> 16) & 0xFF) / 0xFF,
                        ((ii >> 24) & 0xFF) / 0xFF
                    ];

                obj.setID(u_id);

                // here basically you can modify tings
                obj.setProjection(projection);

                renderObject(this.gl, obj, program);

                // Reset color
                obj.setColor(obj.properties.originalColor);
        })} else {
            objsToDraw.forEach((obj, ii) => {
                let objProgram = obj.renderInfo.programInfo;

                // Switch shader if the cached one doesn't work
                if (objProgram !== program)
                { 
                    this.gl.useProgram(objProgram.program);
                    program = objProgram;
                }

                if (obj.properties.blending === true && !this.gl.isEnabled(this.gl.BLEND) )
                {
                    this.gl.enable(this.gl.BLEND);
                }

                obj.setProjection(projection);

                renderObject(this.gl, obj, program);

                // Disable blending
                if (this.gl.isEnabled(this.gl.BLEND) )
                {
                    this.gl.disable(this.gl.BLEND);
                }
        })}
    }

    draw(elapsedTime, fps)
    {
        // convert elapsed time in ms to s
        this.time = elapsedTime * 0.001;
        this.fps = fps;

        // if (this.ext) {
        //     const info = this.ext.getMemoryInfo();
        //     console.log(info);
        // d}

        // set fps
        // if (this.editableText.txtBuffer) this.editableText.txtBuffer.updateTextBufferData(Math.round(this.fps).toString());

        // Resize canvas for display
        if (resizeCanvasToDisplaySize(window.originalRes, this.gl.canvas, window.devicePixelRatio))
        {
            setFramebufferAttachmentSizes(this.gl, this.depthBuffer, this.gl.canvas.width, this.gl.canvas.height, this.renderTexture);
        }

        // Draw the objects to the texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);

        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.disable(this.gl.BLEND);

        // Draw to texture - PASS 1
        this.drawObjects(this.objsToDraw, this.programs[1]);
        
         // Look up id;
        const pixelX = this.mouseX * this.gl.canvas.width / this.gl.canvas.clientWidth;
        const pixelY = this.gl.canvas.height - this.mouseY * this.gl.canvas.height / this.gl.canvas.clientHeight - 1;
        const id = getIdFromCurrentPixel(this.gl, pixelX, pixelY);

        if (id > 0)
        {
            // substract id by 1 to get correct place of the found object in objsToDraw array 
            const pickNdx = id - 1;
            const object = this.objsToDraw[pickNdx];
            this.objUnderMouseID = pickNdx;

            if (object.properties.highlight)
            {
                // change color of the object you're hovering over
                object.setColor([1,1,0.3,1]);

                // change the mouse pointer style
                this.document.style.cursor = "pointer";

            } else resetMousePointer(this.document);

            // select object that will be dragged
            if (this.isMouseDown && this.objectIDtoDrag < 0)
            {
                this.objectIDtoDrag = pickNdx;
            }

            // on click
            if (this.isMouseClicked === true)
            {
                // Set ID of active object
                this.prevActiveObjID = this.activeObjID;
                this.activeObjID = pickNdx;

                if (this.objsToDraw[pickNdx].handlers.onClick)
                {
                    this.objsToDraw[pickNdx].handlers.onClick( [this.mouseX, this.mouseY], this.addObjToScene.bind(this));
                }

                
            }

        }
        else {
            // reset cursor
            resetMousePointer(this.document);
        }

        // Moving the object under the cursor
        if (this.isMouseDown && this.objectIDtoDrag >= 0 && this.objsToDraw[this.objectIDtoDrag].canBeMoved === true )
            {
                if (!this.clickOffset)
                {
                    const obj = this.objsToDraw[this.objectIDtoDrag];
                    let curr_pos = [ obj.worldMatrix[6], obj.worldMatrix[7] ];
                    
                    this.clickOffset = [this.mouseX - curr_pos[0], this.mouseY - curr_pos[1]];
                }

                let parentWorldMat;
                let mouseTranslation = m3.translation(this.mouseX - this.clickOffset[0],this.mouseY - this.clickOffset[1]);

                // Object is a child of some other object
                if (this.objsToDraw[this.objectIDtoDrag].parent)
                {
                    parentWorldMat = this.objsToDraw[this.objectIDtoDrag].parent.worldMatrix;
                    let parentWorldMatInv = m3.inverse(parentWorldMat);
                    
                    let newPos = m3.multiply(parentWorldMatInv, mouseTranslation);

                    this.objsToDraw[this.objectIDtoDrag].setPosition([newPos[6],newPos[7]]);
                }
                else 
                {
                    this.objsToDraw[this.objectIDtoDrag].setPosition([mouseTranslation[6],mouseTranslation[7]]);
                }

                this.objsToDraw[this.objectIDtoDrag].updateWorldMatrix(parentWorldMat);
            }

            if (this.objectIDtoDrag >= 0 && this.objsToDraw[this.objectIDtoDrag].handlers.onMouseMove)
                {
                    let currObj = this.objsToDraw[this.objectIDtoDrag].handlers;
                    currObj.onMouseMove.call(currObj, [this.mouseX, this.mouseY]);
                }

            // reset click offset when mouse is no longer down
            if (!this.isMouseDown && this.clickOffset)
            {
                this.clickOffset = undefined;
            }

        this.isMouseClicked = false;


        // Tell WebGl to use our picking program
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.drawObjects(this.objsToDraw);        
    }
}