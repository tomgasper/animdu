export class TriangleBuffer {
    constructor(gl, programInfo)
    {
        // Make gl object local
        this.gl = gl;

        // Vertex array for this class
        this.VAO = this.gl.createVertexArray();

        // Buffers to hold data for this class
        this.positionBuffer = this.gl.createBuffer();
        this.texture = null;
        this.textureBuffer = this.gl.createBuffer();

        this.programInfo = programInfo;

        this.attributesInfo = {
            position:{
                size : 2,
                type : gl.FLOAT,
                normalize : false,
                stride : 0,
                offset : 0
            },
            texture: {
                size : 2,
                type : gl.FLOAT,
                normalize : true,
                stride : 0,
                offset : 0
            }
        }

        this.bufferData = [
            0,0,
            0,50,
            25,25
        ];

        this.textureData = [
            0,0,
            0,1,
            0.5,0.5
        ]

        this.drawSettings = {
            primitiveType: this.gl.TRIANGLES,
            offset: 0,
            count: this.bufferData.length/this.attributesInfo.position.size
        }
    }
    
    initialize()
    {
        this.bindVertexArray();
        this.setUpPositionBuffer();
        // this.setUpTextureBuffer("./src/texture4.jpg");
    }

    bindVertexArray()
    {
        this.gl.bindVertexArray(this.VAO);
    }

    setUpPositionBuffer()
    {
        // create, bind, upload data, specify layout
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.STATIC_DRAW);

        const attribLoc = this.programInfo.attribLocations.vertexPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        // specify layout
        const { size,type,normalize,stride,offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer( attribLoc, size,type,normalize,stride,offset );
    }

    setUpTextureBuffer(textureSrc)
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureData), this.gl.STATIC_DRAW);

        const attribLoc = this.programInfo.attribLocations.texcoordPosition;
        console.log(attribLoc);
        this.gl.enableVertexAttribArray(attribLoc);
        const { size,type,normalize,stride,offset } = this.attributesInfo.texture;
        this.gl.vertexAttribPointer( attribLoc, size,type,normalize,stride,offset);

        // buffer set up, now create texture and copy it to the buffer
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        // Fills the texture with 1x1 blue pixel
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]));
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);

        const image = new Image();
        image.src = textureSrc;

        image.addEventListener("load", () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        });
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
    };
    
    return vertexArrInfo;
    }

    getDrawInfo() {
        
    const drawInfo = {
        primitiveType: this.drawSettings.primitiveType,
        offset: this.drawSettings.offset,
        count: this.drawSettings.count,
        drawCall: this.draw.bind(this)
    }
    
    return drawInfo;
    }

    changeShader(programInfo) {
        if (!programInfo) throw new Error("Incorrect input shader");

        this.programInfo = programInfo;
    }

    draw()
    {
        let primitiveType = this.gl.TRIANGLES;
        let offset = 0;
        let count = 3;

        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.drawArrays(primitiveType, offset, count);
    }
}
