import { m3, resizeCanvasToDisplaySize, renderObject, computeTransform  } from "./utils.js"

import { TriangleBuffer } from "./Primitives/TriangleBuffer.js";
import { CircleBuffer } from "./Primitives/CircleBuffer.js";

import { GeometryObject } from "./Primitives/GeometryObject.js";

export class Scene
{
    constructor(gl, canvas, programsInfo)
    {
        // save gl for local use
        this.gl = gl;
        this.programs = programsInfo;
        this.canvas = canvas;

        this.sceneObjects = [];
    }

    prepareForRender()
    {
        // Display size might have changed between frames
        resizeCanvasToDisplaySize(this.gl.canvas);

        // Conver from clip space to pixels
        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear the canvas
        this.gl.clearColor(0,0,0,0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    setUpScene()
    {
        // Describe buffer for triangle shape
        const myTriangleBuffer = new TriangleBuffer(this.gl, this.programInfo);
        myTriangleBuffer.initialize();

        // Describe buffer for sphere shape
        const myCircleBuffer = new CircleBuffer(this.gl,this.programInfo);
        myCircleBuffer.initialize();

        const obj1 = new GeometryObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programInfo);
        obj1.transform = computeTransform(this.gl, [250, 500]);

        const obj2 = new GeometryObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programInfo);
        obj2.transform = computeTransform(this.gl, [350, 500]);

        const obj3 = new GeometryObject(myCircleBuffer.getBufferInfo(), myCircleBuffer.getVertexArrInfo(), myCircleBuffer.getDrawInfo(), this.programInfo);
        obj3.transform = computeTransform(this.gl, [100,100]);

        this.addObjToScene(obj1);
        // this.addObjToScene(obj2);
        // this.addObjToScene(obj3);
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

        // Draw the objects to the texture
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        this.gl.enable(gl.CULL_FACE);
        this.gl.enable(gl.DEPTH_TEST);

        this.prepareForRender();

         // ----- Temp copy --------
         this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);
 
         // Tell WebGl to use our picking program
         this.gl.useProgram(this.programInfo[1].program);
         // Draw a lot of objs
         this.sceneObjects.forEach((obj, i) => {
             const ii = i +1;
 
             // Create new data for our objects
             const translation = [time+ii*50,150];
             const angle = 0;
             const scale = [1,1];
             const origin = [0,0];
             const u_id = [
                 ( ((ii) >> 0) & 0xff) / 0xFF,
                 ( ((ii) >> 8) & 0xff) / 0xFF,
                 ( ((ii) >> 16) & 0xff) / 0xFF,
                 ( ((ii) >> 24) & 0xff) / 0xFF
             ];
 
             const projection = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
 
             // Sets parameters internally inside the object and always computes new matrix for new parameter
             obj.setPosRotScaleOrigin(translation,angle,scale,origin);
             obj.setProjection(projection);
             
             renderObject(this.gl, obj);
         })

        // Tell WebGl to use our picking program
        this.gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.gl.useProgram(this.programInfo[0].program);
        // Draw a lot of objs
        this.sceneObjects.forEach((obj, i) => {

            // Create new data for our objects
            const translation = [time+i*50,150];
            const angle = 0;
            const scale = [1,1];
            const origin = [0,0];
            const color = [Math.random(), Math.random(), Math.random(), 1];

            const projection = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

            // Sets parameters internally inside the object and always computes new matrix for new parameter
            obj.setPosRotScaleOrigin(translation,angle,scale,origin);
            obj.setProjection(projection);
            
            renderObject(this.gl, obj);
        })

        gl.canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
         });
    }
}