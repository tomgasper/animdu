import { m3, resizeCanvasToDisplaySize, renderObject, prepareForRender  } from "./utils.js"

import { TriangleBuffer } from "./Primitives/TriangleBuffer.js";
import { CircleBuffer } from "./Primitives/CircleBuffer.js";
import { RectangleBuffer } from "./Primitives/RectangleBuffer.js";
import { CustomBuffer } from "./Primitives/CustomBuffer.js";

import { SceneObject } from "./SceneObject.js";

import { getIdFromCurrentPixel, setFramebufferAttachmentSizes } from "./pickingFramebuffer.js";
import { UIObject } from "./UIObject.js";

import { fontMetrics, writeString } from "../lib/webgl_fonts/textutils.js";
import { initAttribs, bindAttribs } from "../lib/webgl_fonts/glutils.js";

import { TextFont } from "./Text/TextFont.js";

import { createNewText } from "./Text/textHelper.js";

import { roboto_bold_font } from "./fonts/roboto-bold.js";

export class SceneManager
{
    objsToDraw = [];
    txtsToDraw = [];

    framebuffer = {};
    depthBuffer = {};
    renderTexture = {};

    isMouseDown = false;
    mouseX = 0;
    mouseY = 0;

    textRender = {};
    textureSDF = {};
    textureImg = null;
    textSDFVAO = {};

    objectIDtoDrag = -1;

    constructor(gl, canvas, programsInfo, framebuffer, depthBuffer, renderTexture)
    {
        // save gl for local use
        this.gl = gl;
        this.programs = programsInfo;
        this.canvas = canvas;

        this.framebuffer = framebuffer;
        this.depthBuffer = depthBuffer;
        this.renderTexture = renderTexture; 

        // Add event listeners for user input
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

            if (this.objsToDraw[this.objectIDtoDrag])
            {
                this.objsToDraw[this.objectIDtoDrag].properties.color = [0,0,0,1];
            }
            this.objectIDtoDrag = -1;
         })
    }

    setUpScene()
    {
        // Calculate projection matrix for scene objects
        const projectionMat = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);

        // Install font
        const fontSettings = {
            textureSrc: "./src/fonts/roboto-bold.png",
            texResolution: [1024,1024],
            color: [0,0,0,1],
            subpixel: 1.0,
            decoder: roboto_bold_font
        };
        const robotoBoldFont = new TextFont(this.gl, fontSettings, this.gl.LUMINANCE);

        const someText = createNewText(this.gl, this.programs[2], "Hello mate!", robotoBoldFont, projectionMat);
        const someText2 = createNewText(this.gl, this.programs[2], "Text 2", robotoBoldFont, projectionMat);

        // Install UI
        const screen_width = this.gl.canvas.clientWidth;
        const screen_height = this.gl.canvas.clientHeight;

        const customVertsPos = [  0, screen_height/2,
                                  screen_width, screen_height/2,
                                  screen_width, screen_height,
                                  
                                  screen_width, screen_height,
                                  0, screen_height,
                                  0, screen_height/2,
                                ];


        const customBuffer = new CustomBuffer(this.gl, this.programs[0], customVertsPos);
        customBuffer.initialize();

        const customBufferInfo = {
            bufferInfo: customBuffer.getBufferInfo(),
            vertexArrInfo: customBuffer.getVertexArrInfo(),
            drawInfo: customBuffer.getDrawInfo(),
            programInfo: this.programs[0]
        };
 
        const UI_Container = new UIObject(customBufferInfo, projectionMat);
        UI_Container.canBeMoved = false;
        UI_Container.setColor([0,0.3,0.2,1]);
        UI_Container.properties.originalColor = [0.5, 0.3, 0.1, 1];

        // Describe buffer for triangle shape
        const myTriangleBuffer = new TriangleBuffer(this.gl, this.programs[0]);
        myTriangleBuffer.initialize();

        // Describe buffer for sphere shape
        const myCircleBuffer = new CircleBuffer(this.gl,this.programs[0]);
        myCircleBuffer.initialize();

        const myRectangleBuffer = new RectangleBuffer(this.gl,this.programs[0]);
        myRectangleBuffer.initialize();

        const triangleBufferInfo = { bufferInfo: myTriangleBuffer.getBufferInfo(),
                                     vertexArrInfo: myTriangleBuffer.getVertexArrInfo(),
                                     drawInfo: myTriangleBuffer.getDrawInfo(),
                                     programInfo: this.programs[0] };

        const circleBufferInfo = { bufferInfo: myCircleBuffer.getBufferInfo(),
                                    vertexArrInfo: myCircleBuffer.getVertexArrInfo(),
                                    drawInfo: myCircleBuffer.getDrawInfo(),
                                    programInfo: this.programs[0] };

        const rectangleBufferInfo = { bufferInfo: myRectangleBuffer.getBufferInfo(),
            vertexArrInfo: myRectangleBuffer.getVertexArrInfo(),
            drawInfo: myRectangleBuffer.getDrawInfo(),
            programInfo: this.programs[0] };

        const obj1 = new SceneObject(triangleBufferInfo, projectionMat);
        obj1.setPosition([200,50]);

        const obj2 = new SceneObject(triangleBufferInfo, projectionMat);
        obj2.setPosition([250,500]);

        const obj3 = new SceneObject(circleBufferInfo, projectionMat);
        obj3.setPosition([300,100]);

        const obj4 = new SceneObject(triangleBufferInfo, projectionMat);
        obj4.setPosition([250,500]);

        const obj5 = new SceneObject(triangleBufferInfo, projectionMat);
        obj5.setPosition([250,500]);

        const obj6 = new SceneObject(rectangleBufferInfo, projectionMat);
        obj6.setPosition([250,500]);

        // Add all objs
        this.addObjToScene([UI_Container,obj1,obj2,obj3,obj4,obj5,obj6]);
        
        this.txtsToDraw.push(someText, someText2);
        someText.setPosition([100,400]);
        someText2.setPosition([300,400]);
    }

    addObjToScene(objs)
    {
        // Appropriate checks for valid obj
        objs.forEach((obj) => {
            if (obj) { this.objsToDraw.push(obj); }  
        })
    }

    getSceneObjs() {
        return this.objsToDraw;
    }

    drawObjects(objsToDraw, programInfo)
    {
        // to do
        this.gl.useProgram(programInfo.program);

        objsToDraw.forEach((obj, i) => {
            
            // (!) Notice that we are setting id offset by 1
            const ii = i +1 ;

            obj.renderInfo.programInfo = programInfo;

            // if object is pickable then assign it a u_id
            if (obj.canBeMoved === true)
            {
                const u_id = [
                    ((ii >>  0) & 0xFF) / 0xFF,
                    ((ii >>  8) & 0xFF) / 0xFF,
                    ((ii >> 16) & 0xFF) / 0xFF,
                    ((ii >> 24) & 0xFF) / 0xFF
                  ];
     
                  obj.setID(u_id);
            }

            const projection = m3.projection(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
            obj.setProjection(projection);

            renderObject(this.gl, obj);

            // Reset color
            obj.setColor(obj.properties.originalColor);
        })

    }

    draw(elapsedTime)
    {
        // convert elapsed time in ms to s
        const time = elapsedTime * 0.001;

        // Resize canvas for display
        if (resizeCanvasToDisplaySize(window.originalRes, this.gl.canvas, window.devicePixelRatio))
        {
            setFramebufferAttachmentSizes(this.gl, this.depthBuffer, this.gl.canvas.width, this.gl.canvas.height, this.renderTexture);
        }

        // Draw the objects to the texture
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.viewport(0,0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.disable(this.gl.BLEND);

         // Look up id;
        const pixelX = this.mouseX * this.gl.canvas.width / this.gl.canvas.clientWidth;
        const pixelY = this.gl.canvas.height - this.mouseY * this.gl.canvas.height / this.gl.canvas.clientHeight - 1;

        this.drawObjects(this.objsToDraw, this.programs[1]);
        
        const id = getIdFromCurrentPixel(this.gl, pixelX, pixelY);

        console.log(id);

        if (id > 0)
        {
            // substract id by 1 to get correct place of the found object in objsToDraw array 
            const pickNdx = id - 1;
            const object = this.objsToDraw[pickNdx];

            if (this.isMouseDown && this.objectIDtoDrag < 0)
            {
                this.objectIDtoDrag = pickNdx;
            }

            object.setColor([1,1,0.3,1]);
        }

        if (this.isMouseDown && this.objectIDtoDrag >= 0)
            {
                // console.log("moving");
                // console.log(this.objectIDtoDrag);
                this.objsToDraw[this.objectIDtoDrag].setPosition([this.mouseX,this.mouseY]);
            }

        // Tell WebGl to use our picking program
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.drawObjects(this.objsToDraw, this.programs[0]);

        this.gl.enable(this.gl.BLEND);
        this.gl.bindVertexArray(this.txtsToDraw[0].renderInfo.vertexArrInfo.VAO);
        this.gl.useProgram(this.programs[2].program);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.txtsToDraw[0].renderInfo.drawInfo.texture);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.txtsToDraw[0].renderInfo.bufferInfo.position);

        this.drawObjects(this.txtsToDraw, this.programs[2]);

        // this.txtsToDraw[0].setProjection(projection);
        
        // this.txtsToDraw[0].setPosition([100,400]);
        
        // renderObject(this.gl, this.txtsToDraw[0]);
    }

createTextureSDF(gl)
{
const textSDFVAO = gl.createVertexArray();
gl.bindVertexArray(textSDFVAO);

const glyphTex = gl.createTexture();
this.textureSDF = glyphTex;
this.textSDFVAO = textSDFVAO;


gl.bindTexture(gl.TEXTURE_2D, this.textureSDF);

// temp texture
gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 1, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]));


// async img load
const img = new Image();
img.src = "./src/fonts/roboto-bold.png";

this.textureImg = img;

img.addEventListener("load", () =>{
    gl.bindTexture(gl.TEXTURE_2D, this.textureSDF);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, img);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    this.textureImg = img;
});

gl.bindVertexArray(null);
gl.bindTexture(gl.TEXTURE_2D, null);


return glyphTex;

}
}

function createTextSDF(gl, programs, textureImg, textureSDF)
{
    gl.useProgram(programs[3].program);
                    
    gl.enable( gl.BLEND );
    // a bit fckedup code
    var attribs = [
        { loc: 0, name : 'pos',      size: 2 }, // Vertex position
        { loc: 1, name : 'tex0',     size: 2 }, // Texture coordinate
        { loc: 2, name : 'scale',  size: 1 }  // Glyph SDF distance in screen pixels
    ];
    initAttribs( gl, attribs );

    for ( var i = 0; i < attribs.length; ++i ) {
        var a = attribs[ i ];
        gl.bindAttribLocation( programs[3].program, a.loc, a.name );
    }

    // let numAttribs = gl.getProgramParameter(programs[3].program, gl.ACTIVE_ATTRIBUTES);
    // for (let ii = 0; ii < numAttribs; ++ii) {
    // const attribInfo = gl.getActiveAttrib(programs[3].program, ii);
    // const index = gl.getAttribLocation(programs[3].program, attribInfo.name);
    // console.log(index, attribInfo.name);
    // }

    const vertex_array = new Float32Array(1000 * 6 * attribs[0].stride/4 );

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buffer );
    gl.bufferData( gl.ARRAY_BUFFER, vertex_array, gl.DYNAMIC_DRAW );
    gl.bindBuffer( gl.ARRAY_BUFFER, null );
    

    // create Vertex array object
    // create buffer and bind to shader

    // create data for buffer
    let font_color = [0,0,0,1];

    let font_size = 35;
    let font = roboto_bold_font;
    // font.tex = {id:textureSDF, img:textureImg  };
    let fmetrics = fontMetrics(font, font_size, font_size*0.2);

    const font_hinting = 1.0;
    const subpixel = 1.0;

    let str = writeString("helloasd", font, fmetrics, [0,0], vertex_array);
    let vcount = str.array_pos / (attribs[0].stride/4 );

    gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, vertex_array );
    gl.bindBuffer( gl.ARRAY_BUFFER, null );
    

    // pos coords
    // const posBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, vertex_array , gl.DYNAMIC_DRAW );

    // const attribLoc = programsInfo[3].attribLocations.vertexPosition;
    // gl.enableVertexAttribArray(attribLoc);
    // gl.vertexAttribPointer(attribLoc, 2, gl.FLOAT, false, 0, 0);

    // tex coords
    // const texBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, stringVerts.arrays.texcoords, gl.DYNAMIC_DRAW );

    // const attribLoc2 = programsInfo[3].attribLocations.texcoordPosition;
    // gl.vertexAttribPointer(attribLoc2, 2, gl.FLOAT, true, 0, 0);
    // gl.enableVertexAttribArray(attribLoc2);

    // const attribLoc3 = programsInfo[3].attribLocations.sdf_size;
    // gl.vertexAttribPointer(attribLoc3, 1, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(attribLoc2);

    var pixel_ratio = window.devicePixelRatio || 1;

    var cw = Math.round( pixel_ratio * gl.canvas.clientWidth * 0.5 ) * 2.0;
    var ch = Math.round( pixel_ratio * gl.canvas.clientHeight * 0.5 ) * 2.0;
    
    var dx = Math.round( -0.5 * str.rect[2] );
    var dy = Math.round(  0.5 * str.rect[3] );

    var ws = 2.0 / cw;
    var hs = 2.0 / ch;


    const ident = [1,0,0,
        0,-1,0,
        200,100,1];
    const projection = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    

    // Transformation matrix. 3x3 ortho.
    // Canvas size, [0,0] is at the text rect's top left corner, Y goes up.        
    
    var screen_mat = new Float32Array([
        ws,       0,         0,
        0,        hs,        0,
        dx * ws,  dy * hs,   1
    ]);

    screen_mat = m3.multiply(projection, ident);
    
    gl.useProgram(programs[3].program);
    // set uniforms

    gl.uniform1i(programs[3].uniforms.font_tex.location, 0);
    gl.uniformMatrix3fv(programs[3].uniforms.transform.location, false, screen_mat);
    gl.uniform2fv(programs[3].uniforms.sdf_tex_size.location, [textureImg.width, textureImg.height]);
    gl.uniform1f(programs[3].uniforms.sdf_border_size.location, font.iy);
    gl.uniform1f(programs[3].uniforms.hint_amount.location, font_hinting);
    gl.uniform4fv(programs[3].uniforms.font_color.location, font_color);
    gl.uniform1f(programs[3].uniforms.subpixel_amount.location, subpixel);
    

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureSDF);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    //Fcking hell reversed attribs numbers... in firefox and chrome

    bindAttribs(gl, attribs);

    const attribLoc0 = programs[3].attribLocations.pos;
    gl.vertexAttribPointer(attribLoc0, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(attribLoc0);

    const attribLoc1 = programs[3].attribLocations.tex0;
    gl.vertexAttribPointer(attribLoc1, 2, gl.FLOAT, false, 20, 8);
    gl.enableVertexAttribArray(attribLoc1);

    const attribLoc2 = programs[3].attribLocations.scale;
    gl.vertexAttribPointer(attribLoc2, 1, gl.FLOAT, false, 20, 16);
    gl.enableVertexAttribArray(attribLoc2);

    // bind attribs

    

    if ( subpixel == 1.0 ) {
        // Subpixel antialiasing.
        // Method proposed by Radek Dutkiewicz @oomek
        // Text color goes to constant blend factor and 
        // triplet alpha comes from the fragment shader output

        gl.blendColor( font_color[0], font_color[1], font_color[2], 1.0 );
        gl.blendEquation( gl.FUNC_ADD );
        gl.blendFunc( gl.CONSTANT_COLOR, gl.ONE_MINUS_SRC_COLOR );
    } else {
        // Greyscale antialising
        gl.blendEquation( gl.FUNC_ADD );
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    }
    
    
    gl.drawArrays(gl.TRIANGLES, 0, vcount);


    // return {
    //     buffers: {
    //         posCoords: posBuffer,
    //         texCoords: texBuffer,
    //         vertsCount: stringVerts.numVertices
    //     },
    //     VAO: textVAO,
    //     texture: glyphTex,
    //     uniforms:
    //     {
    //         font_tex : 0,
    //         sdf_tex_size : [img.width, img.height],
    //         sdf_border_size: 0,
    //         hint_amount: font_hinting,
    //         font_color: font_color,
    //         subpixel_amount : subpixel
    //     }
    // }

}