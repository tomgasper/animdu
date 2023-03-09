"use strict";
import { m3, resizeCanvasToDisplaySize } from "./utils.js"
import { createShader, createProgram } from "./initShaders.js";

import { TriangleBuffer } from "./Primitives/TriangleBuffer.js";
import { CircleBuffer } from "./Primitives/CircleBuffer.js";

import { TriangleObject } from "./Primitives/TriangleObject.js";
import { CircleObject } from "./Primitives/CircleObject.js";

import { RenderLoop } from "./RenderLoop.js";

var vertexShaderSource = `#version 300 es
// an attribute is an input (in) to a vertex shader
// It will receive data from a buffer

in vec2 a_vertexPosition;
uniform mat3 u_transform;
uniform mat3 u_projection;

// all shaders have a main function
void main()
{
    // this clipping is now in projection matrix
    // vec2 zeroToTwo = (position / u_resolution)*2.0;
    // vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4( (u_projection * u_transform * vec3(a_vertexPosition, 1)).xy, 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es
// pick precision
precision highp float;

uniform vec4 u_color;

// declare an output for the fragment shader
out vec4 outColor;

void main()
{
    outColor = u_color;
}
`;

// attribute = global variable
function main()
  {

    const canvas = document.querySelector("#glcanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl2");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }

    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "a_vertexPosition"),
        },
        uniformLocations: {
            color: gl.getUniformLocation(shaderProgram, "u_color"),
            transform: gl.getUniformLocation(shaderProgram, "u_transform"),
            projection: gl.getUniformLocation(shaderProgram, "u_projection"),
        }
      };


    // Describe buffer for triangle
    const myTriangleBuffer = new TriangleBuffer(gl, programInfo);
    myTriangleBuffer.initialize();

    // Describe buffer for sphere
    const myCircleBuffer = new CircleBuffer(gl,programInfo);
    myCircleBuffer.initialize();

    const obj1 = new TriangleObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), programInfo);
    obj1.transform = computeTransform(gl, [250, 500]);

    const obj2 = new TriangleObject(myTriangleBuffer.getBufferInfo(), myTriangleBuffer.getVertexArrInfo(), myTriangleBuffer.getDrawInfo(), programInfo);
    obj2.transform = computeTransform(gl, [350, 500]);

    const obj3 = new CircleObject(myCircleBuffer.getBufferInfo(), myCircleBuffer.getVertexArrInfo(), myCircleBuffer.getDrawInfo(), programInfo);
    obj3.transform = computeTransform(gl, [100,100]);

    const sceneObjects = [obj1, obj2, obj3];

    const renderLoop = new RenderLoop(drawScene);

    // Start render
    renderLoop.step(undefined);

    // currying - function inside a function
    function drawScene(elapsedTime)
    {
    // convert elapsed time in ms to s
    const time = elapsedTime * 0.001;

    resizeCanvasToDisplaySize(gl.canvas);

    // Conver from clip space to pixels
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell WebGl to use our shader program
    gl.useProgram(shaderProgram);
    
    // Draw a lot of objs
    sceneObjects.forEach((obj, i) => {
        const color = [Math.random(), Math.random(), Math.random(), 1];

        // Upload data to current buffer
        // This actually adds data to the current buffer
        const translation = [time,0];
        const scale = [1,1];
        const angle = 0;
        const origin = [0,0];

        // Compute projection matrix first
        const projection = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
        const transform =  computeTransform(gl, translation, angle, scale, origin);

        obj.projection = projection;
        obj.transform = transform;
        obj.color = color;
        
        renderObject(gl, obj);
        // renderObject(myTriangleBuffer,gl, obj2);

    })
    }

}

// render generic object
function renderObject(gl, obj)
{
    gl.bindVertexArray(obj.vertexArrInfo.VAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferInfo.VBO);

    gl.uniformMatrix3fv(obj.programInfo.uniformLocations.projection, false, obj.projection);
    gl.uniformMatrix3fv(obj.programInfo.uniformLocations.transform, false, obj.transform);

    gl.uniform4fv(obj.programInfo.uniformLocations.color, obj.color);

    // Finally render
    gl.drawArrays(obj.drawInfo.primitiveType, obj.drawInfo.offset, obj.drawInfo.count);
}

function computeTransform(gl, translation =[0,0],angle = 0, scale = [1,1], origin = [0,0])
{
    // Note that the order of the matrix operations is reversed
    // The transformation described by projetionMatrix is applied as the last one
    // Move origin is the first transformation
    let m = m3.translate(m3.identity(), translation[0], translation[1]);
    m = m3.rotate(m, angle);
    m = m3.scale(m, scale[0], scale[1]);
    // move origin
    m = m3.translate(m, origin[0], origin[1]);

    return m;
}
  
main();