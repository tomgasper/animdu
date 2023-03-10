"use strict";
import { m3, resizeCanvasToDisplaySize } from "./utils.js"

import { vertexShaderSource, fragmentShaderSource } from "./Shaders/BasicShaders.js";
import { pickVertexShaderSource, pickVertexShaderSource } from "./Shader/PickerShader.js";
import { initShaderProgram } from "./Shaders/ShaderUtils.js";

import { RenderLoop } from "./RenderLoop.js";
import { Scene } from "./Scene.js";
import { InputManager } from "./InputManager.js";
import { pickfragmentShaderSource } from "./Shaders/PickerShader.js";

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
        },
        uniformLocations: {
            color: gl.getUniformLocation(shaderProgram, "u_color"),
            transform: gl.getUniformLocation(shaderProgram, "u_transform"),
            projection: gl.getUniformLocation(shaderProgram, "u_projection"),
        }
      };

    const pickingProgramInfo = {
      program: pickingProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(pickingProgram, "a_vertexPosition")
      },
      uniformLocations: {
        color: gl.getUniformLocation(shaderProgram, "u_id"),
        transform: gl.getUniformLocation(shaderProgram, "u_transform"),
        projection: gl.getUniformLocation(shaderProgram, "u_projection"),
    }
    };

    const programsInfo = [ programInfo, pickingProgramInfo ];

    // Add frame buffer


    // Create a texture to render to
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture );
    gl.texParameter(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderBuffer(gl.RENDERBUFFER, depthBuffer);

    function setFramebufferAttachmentSizes(width, height) {
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);

      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      const data = null;

      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      width, height, border, format, type, data);

      gl.bindRenderBuffer(gl.RENDERBUFFER, depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTHH_COMPONENT16,width,height);

    }

    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // attache the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

    // make a depth buffer and the same size as the target
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
    
    // Set up scene
    const myScene = new Scene(gl,canvas,programsInfo);
    myScene.setUpScene();

    // Add it to scenes
    const scenes = [];
    scenes.push(myScene);

    // Set up input manager
    const inputManager = new InputManager(gl, canvas, scenes);
    canvas.addEventListener( "click", inputManager.handleOnClick.bind(inputManager) );

    // Set up render loop
    const renderLoop = new RenderLoop( myScene.draw.bind(myScene) );

    // Start render
    renderLoop.step(undefined);
}
  
main();