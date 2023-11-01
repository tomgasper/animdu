export class CircleBuffer {
    constructor(gl, programInfo, radius = 50, resolution = 9, textureSrc) {
        // Make gl object local
        this.gl = gl;
        // Vertex Array for this class
        this.VAO = this.gl.createVertexArray();
        // Buffers to hold data for this class
        this.positionBuffer = this.gl.createBuffer();
        this.indiciesBuffer = this.gl.createBuffer();
        this.textureBuffer = this.gl.createBuffer();
        this.programInfo = programInfo;
        this.bufferData = this.createSphereVertices(radius, resolution, false);
        this.indiciesData = this.createSphereIndices();
        this.textureData = this.createSphereVertices(radius, resolution, true);
        this.attributesInfo = {
            position: {
                size: 2,
                type: gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            indices: {
                size: (((this.bufferData.length - 2) / 2) - 1) * 3,
                type: gl.UNSIGNED_BYTE,
                normalize: false,
                stride: 0,
                offset: 0
            },
            texture: {
                size: 2,
                type: gl.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0
            }
        };
        this.drawSettings = {
            primitiveType: this.gl.TRIANGLES,
            offset: 0,
            count: this.bufferData.length / this.attributesInfo.position.size
        };
        this.initialize(textureSrc);
    }
    initialize(textureSrc) {
        this.bindVertexArray();
        // create bufffers, bind them, upload data, specify layout
        this.setUpPositionBuffer();
        this.setUpIndicesBuffer();
        if (textureSrc) {
            this.setUpTextureBuffer(textureSrc);
        }
    }
    bindVertexArray() {
        this.gl.bindVertexArray(this.VAO);
    }
    setUpPositionBuffer() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.STATIC_DRAW);
        const attribLoc = this.programInfo.attribLocations.vertexPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size, type, normalize, stride, offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer(attribLoc, size, type, normalize, stride, offset);
    }
    setUpIndicesBuffer() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiciesBuffer);
        console.log(this.indiciesData);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indiciesData), this.gl.STATIC_DRAW);
        // const attribLoc = this.programInfo.attribLocations.indiciesLocation;
        // this.gl.enableVertexAttribArray(attribLoc);
        // const { size,type,normalize,stride,offset } = this.attributes.indices;
        // this.gl.vertexAttribPointer(attribLoc, size, type,normalize,stride,offset);
    }
    setUpTextureBuffer(textureSource) {
        // create buffer, bind data(mapping vert to tex coord), enable attrib, specify layout, create texture, copy texture
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureData), this.gl.STATIC_DRAW);
        const attribLoc = this.programInfo.attribLocations.texcoordPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size, type, normalize, stride, offset } = this.attributesInfo.texture;
        this.gl.vertexAttribPointer(attribLoc, size, type, normalize, stride, offset);
        // create texture to copy
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        const img = new Image();
        img.src = textureSource;
        img.addEventListener("load", () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        });
    }
    changeShader(programInfo) {
        if (!programInfo)
            throw new Error("Incorrect input shader");
        this.programInfo = programInfo;
    }
    getBufferInfo() {
        const bufferInfo = {
            VBO: this.VBO
        };
        return bufferInfo;
    }
    getVertexArrInfo() {
        const vertexArrInfo = {
            VAO: this.VAO,
            primitiveType: this.attributesInfo.type,
            offset: this.attributesInfo.offset,
            count: this.bufferData.length / this.attributesInfo.position.size
        };
        return vertexArrInfo;
    }
    createSphereVertices(radius, resolution, normalize) {
        let r = normalize ? 1 : radius;
        let step = (2 * Math.PI) / resolution;
        const float_err = 0.001;
        // first vertex is the centre
        const v_arr = [0, 0];
        for (let i = 0; i <= 2 * Math.PI + float_err; i = i + step) {
            // rotating [1,0] vector
            let x = r * Math.cos(i);
            let y = r * Math.sin(i);
            v_arr.push(x, y);
        }
        return v_arr;
    }
    createSphereIndices() {
        if (!this.bufferData || this.bufferData.length < 2)
            throw new Error("wrong buffer data");
        console.log(this.bufferData.length);
        const centreIndx = 0;
        const indiciesArray = new Uint16Array((((this.bufferData.length - 2) / 2) - 1) * 3);
        let n = 0;
        for (let i = 1; i < (this.bufferData.length - 2) / 2; i++) {
            indiciesArray[n] = i;
            indiciesArray[n + 1] = centreIndx;
            indiciesArray[n + 2] = i + 1;
            n = n + 3;
        }
        return indiciesArray;
    }
    getDrawInfo() {
        const drawInfo = {
            primitiveType: this.drawSettings.primitiveType,
            offset: this.drawSettings.offset,
            count: this.drawSettings.count,
            drawCall: this.draw.bind(this)
        };
        return drawInfo;
    }
    getInfo() {
        const bufferInfo = {
            bufferInfo: this.getBufferInfo(),
            vertexArrInfo: this.getVertexArrInfo(),
            drawInfo: this.getDrawInfo(),
            programInfo: this.programInfo
        };
        return bufferInfo;
    }
    draw() {
        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiciesBuffer);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.drawElements(this.gl.TRIANGLES, this.attributesInfo.indices.size, this.gl.UNSIGNED_SHORT, 0);
    }
}
//# sourceMappingURL=CircleBuffer.js.map