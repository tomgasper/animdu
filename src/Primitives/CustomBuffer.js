export class CustomBuffer {
    constructor(gl, programInfo, bufferData)
    {
         // Make gl object local
         this.gl = gl;

         // Vertex Array for this class
         this.VAO = this.gl.createVertexArray();
 
         // Buffers to hold data for this class
         this.positionBuffer = this.gl.createBuffer();
         this.textureBuffer = this.gl.createBuffer();
     
         this.programInfo = programInfo;
 
         this.bufferData = bufferData;

         this.textureData = undefined;
 
         this.attributesInfo = {
             position : {
                 size : 2,
                 type : this.gl.FLOAT,
                 normalize : false,
                 stride : 0,
                 offset : 0
             }
         }
 
         this.drawSettings = {
             primitiveType: this.gl.TRIANGLES,
             offset: 0,
             count: this.bufferData.length/this.attributesInfo.position.size
         }
     }
    
    initialize()
    {
        this.bindVertexArray();
        // create bufffers, bind them, upload data, specify layout
        this.setUpPositionBuffer();
        // this.setUpIndicesBuffer();
        // this.setUpTextureBuffer("./src/texture4.jpg");
    }

    bindVertexArray()
    {
        this.gl.bindVertexArray(this.VAO);
    }

    setUpPositionBuffer()
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.STATIC_DRAW);

        const attribLoc = this.programInfo.attribLocations.vertexPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size,type,normalize,stride,offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer(attribLoc, size,type,normalize,stride,offset);
    }

    setUpTextureBuffer(textureSource)
    {
        // create buffer, bind data(mapping vert to tex coord), enable attrib, specify layout, create texture, copy texture
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureData), this.gl.STATIC_DRAW);

        const attribLoc = this.programInfo.attribLocations.texcoordPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size,type,normalize,stride,offset } = this.attributesInfo.texture;
        this.gl.vertexAttribPointer( attribLoc,size,type,normalize,stride,offset );

        // create texture to copy
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]));
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);

        const img = new Image();
        img.src = textureSource;
        img.addEventListener("load", () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0 ,this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE,img);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        });
    }

    changeShader(programInfo)
    {
        if (!programInfo) throw new Error("Incorrect input shader");

        this.programInfo = programInfo;
    }

    getBufferInfo() {
    const bufferInfo = {
        postion : this.positionBuffer,
        texture : this.textureBuffer
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
        drawCall: this.draw.bind(this)
    }

    return drawInfo;
    }

    draw()
    {
        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;

        this.gl.drawArrays( primitiveType, offset, count);
    }
}
