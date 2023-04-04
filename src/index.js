"use strict";
import { vertexShaderSource, fragmentShaderSource } from "./Shaders/BasicShaders.js";
import { pickVertexShaderSource, pickfragmentShaderSource } from "./Shaders/PickerShader.js";
import { textSDFVertexShaderSource, textSDFFragmentShaderSource } from "./Shaders/TextShader.js";
import { initShaderProgram } from "./Shaders/ShaderUtils.js";

import { RenderLoop } from "./RenderLoop.js";
import { SceneManager } from "./SceneManager.js";

import { setUpPickingFramebuffer, createDepthBuffer, createPickingTargetTexture } from "./pickingFramebuffer.js";

// attribute = global variable
function main()
  {
    const originalRes = [1280,720];
    window.originalRes = originalRes;

    // Initialize the GL context
    const canvas = document.querySelector("#glcanvas")
    const gl = canvas.getContext("webgl2");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Initalize shader programs
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const pickingProgram = initShaderProgram(gl, pickVertexShaderSource, pickfragmentShaderSource);
    const textSDFProgram = initShaderProgram(gl, textSDFVertexShaderSource, textSDFFragmentShaderSource);

    // Shader properties
    const pickingProgramInfo = {
      program: pickingProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(pickingProgram, "a_vertexPosition"),
      },
      uniforms: {
        id: {
          location: gl.getUniformLocation(pickingProgram, "u_id"),
          type: "4fv"
        },
        transform:
        {
          location: gl.getUniformLocation(pickingProgram, "u_transform"),
          type: "m3fv"
        }
    }
    };

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "a_vertexPosition"),
            texcoordPosition: gl.getAttribLocation(shaderProgram, "a_texcoord")
        },
        uniforms: {
            color:
            {
              location: gl.getUniformLocation(shaderProgram, "u_color"),
              type: "4fv"
            },
            transform:
            {
              location: gl.getUniformLocation(shaderProgram, "u_transform"),
              type: "m3fv"
            }
        }
      };

    const textSDFProgramInfo = {
      program: textSDFProgram,
        attribLocations: {
            pos: gl.getAttribLocation(textSDFProgram, "pos"),
            tex0: gl.getAttribLocation(textSDFProgram, "tex0"),
            scale: gl.getAttribLocation(textSDFProgram, "scale")
        },
        uniforms: {
          font_tex:
            {
              location: gl.getUniformLocation(textSDFProgram, "font_tex"),
              type: "1i"
            },
            transform:
            {
              location: gl.getUniformLocation(textSDFProgram, "transform"),
              type: "m3fv"
            },
            sdf_tex_size:
            {
              location: gl.getUniformLocation(textSDFProgram, "sdf_tex_size"),
              type: "2fv"
            },
            sdf_border_size:
            {
              location: gl.getUniformLocation(textSDFProgram, "sdf_border_size"),
              type: "1f"
            },
            hint_amount:
            {
              location: gl.getUniformLocation(textSDFProgram, "hint_amount"),
              type: "1f"
            },
            subpixel_amount:
            {
              location: gl.getUniformLocation(textSDFProgram, "subpixel_amount"),
              type: "1f"
            },
            font_color:
            {
              location: gl.getUniformLocation(textSDFProgram, "font_color"),
              type: "4fv"
            }

        }
      };

    const programsInfo = [ programInfo, pickingProgramInfo, textSDFProgramInfo ];

    // Setting up a new framebuffer for retriving object under mouse
    // Textures and renderbuffers will be attached to framebuffer

    // Create a texture to render to
    const targetTexture = createPickingTargetTexture(gl);
    const depthBuffer = createDepthBuffer(gl);
    const fb = setUpPickingFramebuffer(gl, targetTexture, depthBuffer);

    // Set up scene
    const sceneManager = new SceneManager(gl,canvas,programsInfo, fb, depthBuffer, targetTexture);
    sceneManager.setUpScene();

    // Set up render loop
    const renderLoop = new RenderLoop( sceneManager.draw.bind(sceneManager) );

    // Start rendering
    renderLoop.step(undefined);
}
  
main();