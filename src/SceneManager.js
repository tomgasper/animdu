import { m3, resizeCanvasToDisplaySize, renderObject, prepareForRender  } from "./utils.js"

import { TriangleBuffer } from "./Primitives/TriangleBuffer.js";
import { CircleBuffer } from "./Primitives/CircleBuffer.js";
import { RectangleBuffer } from "./Primitives/RectangleBuffer.js";
import { CustomBuffer } from "./Primitives/CustomBuffer.js";

import { SceneObject } from "./SceneObject.js";

import { getIdFromCurrentPixel, setFramebufferAttachmentSizes } from "./pickingFramebuffer.js";
import { UIObject } from "./UIObject.js";

import { TextFont } from "./Text/TextFont.js";

import { createNewText } from "./Text/textHelper.js";

import { roboto_bold_font } from "./fonts/roboto-bold.js";

import { Node } from "./Node/Node.js";

export class SceneManager
{
    time = 0.;

    objsToDraw = [];
    txtsToDraw = [];

    framebuffer = {};
    depthBuffer = {};
    renderTexture = {};

    isMouseDown = false;
    isMouseClicked = false;
    mouseX = 0;
    mouseY = 0;

    objectIDtoDrag = -1;

    eventsToProcess = [];

    fontUI = undefined;

    constructor(gl, canvas, programsInfo, framebuffer, depthBuffer, renderTexture)
    {
        // save gl for local use
        this.gl = gl;
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

         this.gl.canvas.addEventListener("mousedown", (e) => {
            if (this.isMouseDown === false) this.isMouseDown = true;
         });

         this.gl.canvas.addEventListener("click", (e) => {
            this.isMouseClicked = true;
         })

         this.gl.canvas.addEventListener("mouseup", (e) => {
            this.isMouseDown = false;

            // realize all events that need to be realized

            if (this.objsToDraw[this.objectIDtoDrag])
            {
                this.objsToDraw[this.objectIDtoDrag].properties.color = [0,0,0,1];
            }
            this.objectIDtoDrag = -1;
         })
    }

    setUpScene()
    {
        // Calculate projection matrix for scene objects
        const projectionMat = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        const screen_width = this.gl.canvas.clientWidth;
        const screen_height = this.gl.canvas.clientHeight;

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

        const someText = createNewText(this.gl, this.programs[2], "New Object", this.fontUI, projectionMat);
        const someText2 = createNewText(this.gl, this.programs[2], "See stats", this.fontUI, projectionMat);

        someText.handlers.onClick = () => {
            const projectionMat = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
            const someText = createNewText(this.gl, this.programs[2], "Dynamically added text!", this.fontUI, projectionMat);
            this.addObjToScene([someText]);
            console.log("added");
        };

        const y_offset = screen_height * 0.02;
        const x_offset = screen_width * 0.02;

        someText.setPosition([x_offset,screen_height/2 + y_offset]);
        someText.canBeMoved = false;
        someText.blending = true;
        someText.setScale([0.6,0.6]);

        someText2.setPosition([x_offset+150, screen_height/2 + y_offset]);
        someText2.canBeMoved = false;
        someText2.blending = true;
        someText2.setScale([0.6,0.6]);

        // Install UI
        const customVertsPos = [  0, screen_height/2,
                                  screen_width, screen_height/2,
                                  screen_width, screen_height,
                                  
                                  screen_width, screen_height,
                                  0, screen_height,
                                  0, screen_height/2,
                                ];


        const customBuffer = new CustomBuffer(this.gl, this.programs[0], customVertsPos);
        customBuffer.initialize();

        const customBufferInfo = {
            bufferInfo: customBuffer.getBufferInfo(),
            vertexArrInfo: customBuffer.getVertexArrInfo(),
            drawInfo: customBuffer.getDrawInfo(),
            programInfo: this.programs[0]
        };
 
        const UI_Container = new UIObject(customBufferInfo, projectionMat);
        UI_Container.canBeMoved = false;
        UI_Container.setColor([0,0.3,0.2,1]);
        UI_Container.properties.originalColor = [0, 0.02, 0.04, 1];

        // Describe buffer for triangle shape
        const myTriangleBuffer = new TriangleBuffer(this.gl, this.programs[0]);
        myTriangleBuffer.initialize();

        // Describe buffer for sphere shape
        const myCircleBuffer = new CircleBuffer(this.gl,this.programs[0]);
        myCircleBuffer.initialize();

        const myRectangleBuffer = new RectangleBuffer(this.gl,this.programs[0]);
        myRectangleBuffer.initialize();

        const triangleBufferInfo = { bufferInfo: myTriangleBuffer.getBufferInfo(),
                                     vertexArrInfo: myTriangleBuffer.getVertexArrInfo(),
                                     drawInfo: myTriangleBuffer.getDrawInfo(),
                                     programInfo: this.programs[0] };

        const circleBufferInfo = { bufferInfo: myCircleBuffer.getBufferInfo(),
                                    vertexArrInfo: myCircleBuffer.getVertexArrInfo(),
                                    drawInfo: myCircleBuffer.getDrawInfo(),
                                    programInfo: this.programs[0] };

        const rectangleBufferInfo = { bufferInfo: myRectangleBuffer.getBufferInfo(),
            vertexArrInfo: myRectangleBuffer.getVertexArrInfo(),
            drawInfo: myRectangleBuffer.getDrawInfo(),
            programInfo: this.programs[0] };

        const obj1 = new SceneObject(triangleBufferInfo, projectionMat);
        obj1.setPosition([100,500]);
        obj1.setRotation(0.6);

        const obj2 = new SceneObject(triangleBufferInfo, projectionMat);
        obj2.setPosition([50,0]);
        obj2.setRotation(1.5);

        const obj3 = new SceneObject(circleBufferInfo, projectionMat);
        obj3.setPosition([150,0]);
        obj3.setRotation(-0.9);

        const obj4 = new SceneObject(triangleBufferInfo, projectionMat);
        obj4.setPosition([50,0]);

        const obj5 = new SceneObject(triangleBufferInfo, projectionMat);
        obj5.setPosition([50,0]);

        const obj6 = new SceneObject(rectangleBufferInfo, projectionMat);
        obj6.setPosition([50,0]);

        // const layer2 = new Node();
        // layer2.localMatrix = [1,0,0,
        //                     0,1,0,
        //                     50,25,1];

        obj6.setParent(obj5);
        obj5.setParent(obj4);
        obj4.setParent(obj3);
        obj3.setParent(obj2);
        obj2.setParent(obj1);
        obj1.updateWorldMatrix();

        // Add all objs
        this.addObjToScene([UI_Container,obj1,obj2,obj3,obj4,obj5,obj6, someText, someText2]);
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

                obj.setProjection(projection);

                renderObject(this.gl, obj, program, true);

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

                if (obj.blending === true && !this.gl.isEnabled(this.gl.BLEND) )
                {
                    this.gl.enable(this.gl.BLEND);
                }

                obj.setProjection(projection);
                renderObject(this.gl, obj, program, false);

                // Disable blending
                if (this.gl.isEnabled(this.gl.BLEND) )
                {
                    this.gl.disable(this.gl.BLEND);
                }
        })}
    }

    draw(elapsedTime)
    {
        // convert elapsed time in ms to s
        this.time = elapsedTime * 0.001;

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

        // Draw to texture shades - PASS 1
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

            if (this.isMouseDown && this.objectIDtoDrag < 0)
            {
                this.objectIDtoDrag = pickNdx;
            }

            object.setColor([1,1,0.3,1]);

            // on click
            if (this.isMouseClicked === true)
            {
                if (this.objsToDraw[pickNdx].handlers.onClick)
                {
                    this.objsToDraw[pickNdx].handlers.onClick();
                }
            }

        }

        // Moving the object under the coursor
        if (this.isMouseDown && this.objectIDtoDrag >= 0 && this.objsToDraw[this.objectIDtoDrag].canBeMoved === true )
            {
                let parentWorldMat;
                let mouseTranslation = m3.translation(this.mouseX,this.mouseY);

                let top_parent = this.objsToDraw[this.objectIDtoDrag];

                if (this.objsToDraw[this.objectIDtoDrag].parent)
                {
                    top_parent = this.objsToDraw[this.objectIDtoDrag].parent;

                    while (top_parent.parent)
                    {
                        top_parent = top_parent.parent;
                    }

                    parentWorldMat = this.objsToDraw[this.objectIDtoDrag].parent.worldMatrix;
                    let parentWorldMatInv = m3.inverse(parentWorldMat);
                    
                    // if diagonal sin is negative then change sign of acos
                    // let acos = Math.acos(wMatrix[0]);
                    // if (wMatrix[4] < 0) acos = -acos;
                    // let rot = m3.rotation(acos);
                    
                    let newPos = m3.multiply(parentWorldMatInv, mouseTranslation);
                    this.objsToDraw[this.objectIDtoDrag].setPosition([newPos[6],newPos[7]]);
                }
                else 
                {
                    this.objsToDraw[this.objectIDtoDrag].setPosition([mouseTranslation[6],mouseTranslation[7]]);
                }

                this.objsToDraw[this.objectIDtoDrag].updateWorldMatrix(parentWorldMat);
            }

        // Tell WebGl to use our picking program
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.drawObjects(this.objsToDraw);

        // reset input handlers state
        this.isMouseClicked = false;
    }
}