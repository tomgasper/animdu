"use strict";
import { m3, resizeCanvasToDisplaySize } from "./utils.js"

import { vertexShaderSource, fragmentShaderSource } from "./Shaders/BasicShaders.js";
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
    var shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

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
    
    const myScene = new Scene(gl,programInfo);
    myScene.setUpScene();

    const renderLoop = new RenderLoop( myScene.draw.bind(myScene) );

    // Start render
    renderLoop.step(undefined);
}
  
main();