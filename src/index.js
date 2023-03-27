"use strict";
import { m3, resizeCanvasToDisplaySize } from "./utils.js"

import { vertexShaderSource, fragmentShaderSource } from "./Shaders/BasicShaders.js";
import { pickVertexShaderSource, pickfragmentShaderSource } from "./Shaders/PickerShader.js";
import { initShaderProgram } from "./Shaders/ShaderUtils.js";

import { RenderLoop } from "./RenderLoop.js";
import { Scene } from "./Scene.js";

// attribute = global variable
function main()
  {
    // Initialize the GL context
    const canvas = document.querySelector("#glcanvas")
    const gl = canvas.getContext("webgl2");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }

    // Initalize basic shader program
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const pickingProgram = initShaderProgram(gl, pickVertexShaderSource, pickfragmentShaderSource);

    // Shader properties
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "a_vertexPosition"),
            texcoordPosition: gl.getAttribLocation(shaderProgram, "a_texcoord")
        },
        uniformLocations: {
            color: gl.getUniformLocation(shaderProgram, "u_color"),
            transform: gl.getUniformLocation(shaderProgram, "u_transform"),
            projection: gl.getUniformLocation(shaderProgram, "u_projection")
        }
      };

    const pickingProgramInfo = {
      program: pickingProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(pickingProgram, "a_vertexPosition"),
      },
      uniformLocations: {
        id: gl.getUniformLocation(pickingProgram, "u_id"),
        transform: gl.getUniformLocation(pickingProgram, "u_transform"),
        projection: gl.getUniformLocation(pickingProgram, "u_projection"),
    }
    };

    const programsInfo = [ programInfo, pickingProgramInfo ];

    // Ok so textures and renderbuffers can be attached to framebuffers

    // Create a texture to render to
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1280, 720, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1280,720);

    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,fb);

    // attache the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Set up scene
    const myScene = new Scene(gl,canvas,programsInfo, fb, depthBuffer, targetTexture);
    myScene.setUpScene();

    // Add it to scenes
    const scenes = [];
    scenes.push(myScene);

    // Set up input manager

    // Set up render loop
    const renderLoop = new RenderLoop( myScene.draw.bind(myScene) );

    // Start render
    renderLoop.step(undefined);
}
  
main();