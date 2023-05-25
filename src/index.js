"use strict";
import { vertexShaderSource, fragmentShaderSource } from "./Shaders/BasicShaders.js";
import { pickVertexShaderSource, pickfragmentShaderSource } from "./Shaders/PickerShader.js";
import { textSDFVertexShaderSource, textSDFFragmentShaderSource } from "./Shaders/TextShader.js";
import { instancedLineFragmentShaderSource, instancedLineVertexShaderSource } from "./Shaders/InstancedLineShader.js";
import { instancedLineCapFragmentShaderSource, instancedLineCapVertexShaderSource } from "./Shaders/InstancedLineCapShader.js";
import { initShaderProgram } from "./Shaders/ShaderUtils.js";

import { RenderLoop } from "./RenderLoop.js";
import { App } from "./App/App.js";

import { setUpPickingFramebuffer, createDepthBuffer, createPickingTargetTexture } from "./pickingFramebuffer.js";

// attribute = global variable
function main()
  {
    const originalRes = [1920,1080];
    window.originalRes = originalRes;

    // Initialize the GL context
    const canvas = document.querySelector("#glcanvas")
    const gl = canvas.getContext("webgl2");

    // Extensions
    const ext = gl.getExtension('GMAN_webgl_memory');

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Initalize shader programs
    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    const pickingProgram = initShaderProgram(gl, pickVertexShaderSource, pickfragmentShaderSource);
    const textSDFProgram = initShaderProgram(gl, textSDFVertexShaderSource, textSDFFragmentShaderSource);
    const instancedLineProgram = initShaderProgram(gl, instancedLineVertexShaderSource, instancedLineFragmentShaderSource);
    const instancedLineCapProgram = initShaderProgram(gl, instancedLineCapVertexShaderSource, instancedLineCapFragmentShaderSource);

    // Shader properties
    const pickingProgramInfo = {
      program: pickingProgram,
      attribLocations: {
        vertexPosition: 0,
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
            vertexPosition: 0,
            texcoordPosition: 1
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
            pos: 0,
            tex0: 1,
            scale: 2
        },
        uniforms: {
          font_tex:
            {
              location: gl.getUniformLocation(textSDFProgram, "font_tex"),
              type: "1i"
            },
            transform:
            {
              location: gl.getUniformLocation(textSDFProgram, "u_transform"),
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

    const instancedLineProgramInfo = {
      program: instancedLineProgram,
      attribLocations: {
          vertexPosition: 0,
          pointA: 1,
          pointB: 2,
      },
      uniforms: {
        width:
        {
          location: gl.getUniformLocation(instancedLineProgram, "u_width"),
          type: "1f"
        },
        color:
        {
          location: gl.getUniformLocation(instancedLineProgram, "u_color"),
          type: "4fv"
        },
        transform:
        {
          location: gl.getUniformLocation(instancedLineProgram, "u_transform"),
          type: "m3fv"
        }
      }
    };

    const instancedLineCapProgramInfo = {
      program: instancedLineCapProgram,
      attribLocations: {
          vertexPosition: 0,
          point: 1
      },
      uniforms: {
        width:
        {
          location: gl.getUniformLocation(instancedLineCapProgram, "u_width"),
          type: "1f"
        },
        color:
        {
          location: gl.getUniformLocation(instancedLineCapProgram, "u_color"),
          type: "4fv"
        },
        transform:
        {
          location: gl.getUniformLocation(instancedLineCapProgram, "u_transform"),
          type: "m3fv"
        }
      }
    };

    const programsInfo = [ programInfo,
                          pickingProgramInfo, 
                          textSDFProgramInfo,
                          instancedLineProgramInfo,
                          instancedLineCapProgramInfo
    ];

    // Framebuffer for retriving object under mouse

    // Textures and renderbuffers will be attached to framebuffer
    // Create a texture to render to
    const targetTexture = createPickingTargetTexture(gl);
    const depthBuffer = createDepthBuffer(gl);
    const fb = setUpPickingFramebuffer(gl, targetTexture, depthBuffer);

    // Set up new application
    const app = new App(gl,canvas,programsInfo, fb, depthBuffer, targetTexture);

    // Set up render loop
    const renderLoop = new RenderLoop( app.doFrame.bind(app) );

    // Set up memory info plugin
    if (ext) {
      const info = ext.getMemoryInfo();
      console.log(info);
    };

    // Start rendering
    renderLoop.render();
}
  
main();