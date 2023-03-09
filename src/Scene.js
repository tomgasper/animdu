import { m3, resizeCanvasToDisplaySize, renderObject, computeTransform  } from "./utils.js"

import { TriangleBuffer } from "./Primitives/TriangleBuffer.js";
import { CircleBuffer } from "./Primitives/CircleBuffer.js";

import { TriangleObject } from "./Primitives/TriangleObject.js";
import { CircleObject } from "./Primitives/CircleObject.js";

export class Scene
{
    constructor(gl, programInfo)
    {
        // save gl for local use
        this.gl = gl;
        this.programInfo = programInfo;

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

        const obj1 = new TriangleObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programInfo);
        obj1.transform = computeTransform(this.gl, [250, 500]);

        const obj2 = new TriangleObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), this.programInfo);
        obj2.transform = computeTransform(this.gl, [350, 500]);

        const obj3 = new CircleObject(myCircleBuffer.getBufferInfo(), myCircleBuffer.getVertexArrInfo(), myCircleBuffer.getDrawInfo(), this.programInfo);
        obj3.transform = computeTransform(this.gl, [100,100]);

        this.sceneObjects.push(obj1,obj2,obj3);
    }

    draw(elapsedTime)
    {
    // convert elapsed time in ms to s
    const time = elapsedTime * 0.001;

    this.prepareForRender();

    // Tell WebGl to use our shader program
    this.gl.useProgram(this.programInfo.program);
    
    // Draw a lot of objs
    this.sceneObjects.forEach((obj, i) => {

        // Create new data for our objects
        const translation = [time+i*50,150];
        const scale = [1,1];
        const angle = 0;
        const origin = [0,0];

        const color = [Math.random(), Math.random(), Math.random(), 1];

        // Compute projection matrix first
        const projection = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
        const transform =  computeTransform(this.gl, translation, angle+time, scale, origin);

        // Modify objects properties here
        obj.projection = projection;
        obj.transform = transform;
        obj.color = color;
        
        renderObject(this.gl, obj);
    })
    }
}