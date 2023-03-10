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