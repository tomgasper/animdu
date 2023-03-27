import { m3, resizeCanvasToDisplaySize, renderObject, computeTransform  } from "./utils.js"

import { TriangleBuffer } from "./Primitives/TriangleBuffer.js";
import { CircleBuffer } from "./Primitives/CircleBuffer.js";

import { GeometryObject } from "./Primitives/GeometryObject.js";

export class Scene
{
    constructor(gl, canvas, programsInfo, framebuffer, depthBuffer, renderTexture)
    {
        // save gl for local use
        this.gl = gl;
        this.programs = programsInfo;
        this.canvas = canvas;

        this.sceneObjects = [];

        this.oldPickNdx = -1;
        this.oldPickColor = 0;
        this.frameCount = 0;

        this.framebuffer = framebuffer;
        this.depthBuffer = depthBuffer;
        this.renderTexture = renderTexture;

        this.mouseX = 0;
        this.mouseY = 0;

        this.objectIDtoDrag = 0;
        this.isMouseDown = false;

        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
         });

         this.gl.canvas.addEventListener("mousedown", (e) => {
            if (this.isMouseDown === false) this.isMouseDown = true;
         })

         this.gl.canvas.addEventListener("mouseup", (e) => {
            this.isMouseDown = false;

            if (this.sceneObjects[this.objectIDtoDrag])
            {
                this.sceneObjects[this.objectIDtoDrag].color = [0,0,0,1];
            }
            this.objectIDtoDrag = -1;
         })
    }

    prepareForRender()
    {
        // Display size might have changed between frames
        resizeCanvasToDisplaySize(this.gl.canvas);

        // Conver from clip space to pixels
        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear the canvas
        // this.gl.clearColor(0,0,0,0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    setUpScene()
    {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // Describe buffer for triangle shape
        const myTriangleBuffer = new TriangleBuffer(this.gl, this.programs[0]);
        myTriangleBuffer.initialize();

        // Describe buffer for sphere shape
        const myCircleBuffer = new CircleBuffer(this.gl,this.programs[0]);
        myCircleBuffer.initialize();

        const obj1 = new GeometryObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programs[0]);
        obj1.transform = computeTransform(this.gl, [250, 500]);

        const obj2 = new GeometryObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programs[0]);
        obj2.transform = computeTransform(this.gl, [350, 500]);

        const obj3 = new GeometryObject(myCircleBuffer.getBufferInfo(), myCircleBuffer.getVertexArrInfo(), myCircleBuffer.getDrawInfo(), this.programs[0]);
        obj3.transform = computeTransform(this.gl, [100,100]);

        const obj4 = new GeometryObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programs[0]);
        obj1.transform = computeTransform(this.gl, [250, 500]);

        const obj5 = new GeometryObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programs[0]);
        obj1.transform = computeTransform(this.gl, [250, 500]);

        this.addObjToScene(obj1);
        this.addObjToScene(obj2);
        this.addObjToScene(obj3);
        this.addObjToScene(obj4);
        this.addObjToScene(obj5);
    }

    addObjToScene(obj)
    {
        // To do
        // Appropriate checks for valid obj
        if (obj) { this.sceneObjects.push(obj); }
    }

    getSceneObjs() {
        return this.sceneObjects;
    }

    draw(elapsedTime)
    {
        // convert elapsed time in ms to s
        const time = elapsedTime * 0.001;
        ++this.frameCount;

        // Draw the objects to the texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.setFramebufferAttachmentSizes(this.depthBuffer, this.gl.canvas.width, this.gl.canvas.height, this.renderTexture);

        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

         // ----- Temp copy --------

         // Look up id;
        const pixelX = this.mouseX * this.gl.canvas.width / this.gl.canvas.clientWidth;
        const pixelY = this.gl.canvas.height - this.mouseY * this.gl.canvas.height / this.gl.canvas.clientHeight - 1;
 
         // Tell WebGl to use our picking program
         this.gl.useProgram(this.programs[1].program);
         // Draw a lot of objs
         this.sceneObjects.forEach((obj, i) => {
             const ii = i +1 ;

             obj.programInfo = this.programs[1];
 
             // Create new data for our objects
             // const translation = [time+ii*50,150];

             const translation = obj.position;
             const angle = 0;
             const scale = [1,1];
             const origin = [0,0];
             const u_id = [
                ((ii >>  0) & 0xFF) / 0xFF,
                ((ii >>  8) & 0xFF) / 0xFF,
                ((ii >> 16) & 0xFF) / 0xFF,
                ((ii >> 24) & 0xFF) / 0xFF
              ];
 
             const projection = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
 
             // Sets parameters internally inside the object and always computes new matrix for new parameter
             obj.setPosRotScaleOrigin(translation,angle,scale,origin);
             obj.setProjection(projection);
             obj.setID(u_id);
             
             renderObject(this.gl, obj);
         })
        
        const data = new Uint8Array(4);
        this.gl.readPixels(
            pixelX,            // x
            pixelY,            // y
            1,                 // width
            1,                 // height
            this.gl.RGBA,           // format
            this.gl.UNSIGNED_BYTE,  // type
            data);             // typed array to hold result
        
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

        // restore object's color
        // if (this.oldPickNdx >= 0)
        // {
        //     const object = this.sceneObjects[oldPickNdx];
        //     object.uniforms.u_colorMult = oldPickColor;
        //     oldPickNdx = -1;
        // }

        if (id > 0)
        {
            console.log(id);
            const pickNdx = id - 1;
            this.oldPickNdx = pickNdx;
            const object = this.sceneObjects[pickNdx];
            this.oldPickColor = object.color;

            if (this.isMouseDown && this.objectIDtoDrag < 0)
            {
                this.objectIDtoDrag = pickNdx;
                console.log(this.objectIDtoDrag);
            }

            object.setColor([1,1,0.3,1]);
        }

        if (this.isMouseDown && this.objectIDtoDrag >= 0)
            {
                console.log(this.objectIDtoDrag);
                this.sceneObjects[this.objectIDtoDrag].setPosition([this.mouseX,this.mouseY]);
            }

        // Tell WebGl to use our picking program
        
        resizeCanvasToDisplaySize(this.gl.canvas);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        // this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.useProgram(this.programs[0].program);
        // Draw a lot of objs
        this.sceneObjects.forEach((obj, i) => {
            const ii = i +1;

            obj.programInfo = this.programs[0];

            // Create new data for our objects
            //const translation = [time+ii*50,150];
            const translation = obj.position;
            const angle = 0;
            const scale = [1,1];
            const origin = [0,0];

            
            const color = obj.color;

            const projection = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

            // Sets parameters internally inside the object and always computes new matrix for new parameter
            obj.setPosRotScaleOrigin(translation,angle,scale,origin);
            obj.setProjection(projection);
            obj.setColor(color);
            
            renderObject(this.gl, obj);

            // reset obj color
            obj.setColor([0,0,0,1]);
        });
    }

    setFramebufferAttachmentSizes(depthBuffer, width, height, renderTexture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, renderTexture);
  
        const level = 0;
        const internalFormat = this.gl.RGBA;
        const border = 0;
        const format = this.gl.RGBA;
        const type = this.gl.UNSIGNED_BYTE;
        const data = null;
  
        this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);
  
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16,width,height);
      }
}