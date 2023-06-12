import { fontMetrics, writeString } from "../../lib/webgl_fonts/textutils.js";

export class TextBuffer {
    VAO = undefined;

    position = {
        buffer: undefined,
        data: undefined
    };

    texture = {};

    attributesInfo = {};
    drawSetting = {};
    programInfo = {};

    font = {};
    fontColor = [0,0,0,1];

    str = {};

    constructor(gl, programInfo, font, txtString, txtSize, fontColor = [0,0,0,1.])
    {
         // Make gl object local
         this.gl = gl;
         this.font = font;

         this.fontColor = fontColor;

         // Create VAO and generate data based on input text string on start
         this.VAO = this.gl.createVertexArray();

         // Buffers to hold data for this class
         this.position.buffer = this.gl.createBuffer();
         this.texture = this.font.texture;

         this.programInfo = programInfo;
 
         this.attributesInfo = {
             position: {
                 size : 2,
                 type : this.gl.FLOAT,
                 normalize : false,
                 stride : 20,
                 offset : 0
             },
             tex0: {
                size : 2,
                type : this.gl.FLOAT,
                normalize : false,
                stride : 20,
                offset : 8
             },
             scale: {
                size : 1,
                type : this.gl.FLOAT,
                normalize : false,
                stride : 20,
                offset : 16
             },
         }
 
         this.drawSettings = {
             primitiveType: this.gl.TRIANGLES,
             offset: 0,
             count: 0 // not set on start
         }

         this.position.data = this.generateTextBufferData(txtString, txtSize);
         console.log(this.position.data);
         
         this.initialize();
     }
    
    initialize()
    {
        this.gl.bindVertexArray(this.VAO);

        // create bufffers, bind them, upload data, specify layout
        this.setUpPositionBuffer();
        this.setUpTextureBuffer();
        this.setUpScaleBuffer();
    }

    generateTextBufferData(txtString, font_size = 20)
    {
        font_size = font_size;

        let font = this.font.decoder;
        let fmetrics = fontMetrics(font, font_size, font_size*0.2);

        let str;

        let vertex_data;

        // draw from array of strings
        if (typeof txtString[0] !== "string")
        {
            let count = 0;
            for (let i = 0; i < txtString.length; i++)
                {
                    if (typeof txtString[i].data !== "string") throw Error("Incorrect data for text render!");
                    count += txtString[i].data.length;
                }

            vertex_data = new Float32Array(count * 6 * this.attributesInfo.position.stride/4 + 3);

            // Write with offset
            let vertex_data_offset = 0;
            for (let i = 0; i < txtString.length; i++)
            {
                str = writeString(txtString[i].data, font, fmetrics, txtString[i].pos, vertex_data,0,vertex_data_offset);

                vertex_data_offset = str.array_pos;
            }
        } else {
            vertex_data = new Float32Array(txtString.length * 6 * this.attributesInfo.position.stride/4 + 3);
            str = writeString(txtString, font, fmetrics, [0,0], vertex_data);
        }


        this.str = str;

        let vcount = str.array_pos / (this.attributesInfo.position.stride/4 );

        this.drawSettings.count = vcount;

        return vertex_data;
    }

    writeArrStr(strsArr)
    {
        let count = 0;
        for (let i = 0; i < strsArr.length; i++)
            {
                count += strsArr[i].data.length;
            }

        const vertex_data = new Float32Array(count * 6 * this.attributesInfo.position.stride/4 + 3);
        let vertex_data_offset = 0;

        for (let i = 0; i < strsArr.length; i++)
        {
            count += strsArr[i].data.length;
            str = writeString(strsArr[i].data, font, fmetrics, [0,0], vertex_data,0,vertex_data_offset);

            vertex_data_offset += str.res.array_pos;
        }
    }

    updateTextBufferData(txtString, txtSize)
    {
        this.position.data = this.generateTextBufferData(txtString, txtSize);

        this.gl.bindVertexArray(this.VAO);
        this.setUpPositionBuffer();
    }

    setUpPositionBuffer()
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.position.buffer);
        //this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.position.data);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.position.data, this.gl.STATIC_DRAW);

        // Enable attribute
        const attribLoc = this.programInfo.attribLocations.pos;
        // Set attribute and bind with current VAO
        const { size,type,normalize,stride,offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer(attribLoc, size,type,normalize,stride,offset);

        this.gl.enableVertexAttribArray(attribLoc);
    }

    setUpTextureBuffer()
    {
        // notice that we are binding to one buffer with position, texcoords and scale
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.position.buffer);

        const attribLoc = this.programInfo.attribLocations.tex0;

        const { size,type,normalize,stride,offset } = this.attributesInfo.tex0;
        this.gl.vertexAttribPointer( attribLoc,size,type,normalize,stride,offset );

        this.gl.enableVertexAttribArray(attribLoc);
    }

    setUpScaleBuffer()
    {
        // notice that we are binding to one buffer with position, texcoords and scale
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.position.buffer);

        const attribLoc = this.programInfo.attribLocations.scale;

        const { size,type,normalize,stride,offset } = this.attributesInfo.scale;
        this.gl.vertexAttribPointer( attribLoc,size,type,normalize,stride,offset );

        this.gl.enableVertexAttribArray(attribLoc);
    }

    changeShader(programInfo)
    {
        if (!programInfo) throw new Error("Incorrect input shader");

        this.programInfo = programInfo;
    }

    getBufferInfo() {
    const bufferInfo = {
        position : this.position.buffer,
        updateText: this.updateTextBufferData
    };

    return bufferInfo;
    }

    getVertexArrInfo() {
    const vertexArrInfo = {
        VAO : this.VAO,
        primitiveType: this.attributesInfo.position.type,
        offset: this.attributesInfo.position.offset,
    };

    return vertexArrInfo;
    }

    getDrawInfo()
    {
    const drawInfo = {
        primitiveType: this.drawSettings.primitiveType,
        offset: this.drawSettings.offset,
        count: this.drawSettings.count,
        drawCall: this.draw.bind(this),
        texture: this.texture
    }

    return drawInfo;
    }

    draw()
    {
        if (typeof this.font.color === undefined || typeof this.font.subpixel === undefined )
        {
            throw new Error("Font color or subpixel amount not provided!");
        }

        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;

        if ( this.font.subpixel === 1.0 ) {
            // Subpixel antialiasing.
            // Method proposed by Radek Dutkiewicz @oomek
            // Text color goes to constant blend factor and 
            // triplet alpha comes from the fragment shader output
    
            this.gl.blendColor( this.fontColor[0], this.fontColor[1], this.fontColor[2], 1.0 );
            // this.gl.blendColor( 0.5, 0.5, 0.5, 1.0 );
            this.gl.blendEquation( this.gl.FUNC_ADD );
            this.gl.blendFunc( this.gl.CONSTANT_COLOR, this.gl.ONE_MINUS_SRC_COLOR );
        } else {
            // Greyscale antialising
            this.gl.blendEquation( this.gl.FUNC_ADD );
            this.gl.blendFunc( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA );
        }
        
        this.gl.drawArrays(primitiveType, offset, count);
    }
}
