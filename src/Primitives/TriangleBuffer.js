export class TriangleBuffer {
    constructor(gl, programInfo)
    {
        // Make gl object local
        this.gl = gl;

        this.VBO = this.gl.createBuffer();
        this.VAO = this.gl.createVertexArray();

        this.programInfo = programInfo;

        this.attributes = {
            size : 2,
            type : gl.FLOAT,
            normalize : false,
            stride : 0,
            offset : 0
        }

        this.bufferData = [
            0,0,
            0,50,
            25,25
        ];

        this.drawSettings = {
            primitiveType: this.gl.TRIANGLES,
            offset: 0,
            count: this.bufferData.length/this.attributes.size
        }
    }
    
    initialize()
    {
        this.bindVertexArray();
        this.enableVertexAttrib();

        this.bindBuffer();
        this.initData();
        this.specifyLayout();

    }

    bindBuffer()
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
    }

    bindVertexArray()
    {
        this.gl.bindVertexArray(this.VAO);
    }

    enableVertexAttrib()
    {
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    }

    initData()
    {
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.STATIC_DRAW);
    }

    getBufferInfo()
    {
    const bufferInfo = {
        VBO : this.VBO
    };

    return bufferInfo;
    }

    getVertexArrInfo()
    {
    const vertexArrInfo = {
        VAO : this.VAO,
    };
    
    return vertexArrInfo;
    }

    getDrawInfo()
    {
    const drawInfo = {
        primitiveType: this.drawSettings.primitiveType,
        offset: this.drawSettings.offset,
        count: this.drawSettings.count
    }
    
    return drawInfo;
    }

    changeShader(programInfo)
    {
        if (!programInfo) throw new Error("Incorrect input shader");

        this.programInfo = programInfo;
    }

    specifyLayout()
    {
        this.gl.vertexAttribPointer(
            this.programInfo.attribLocations.vertexPosition,
            this.attributes.size,
            this.attributes.type,
            this.attributes.normalize,
            this.attributes.stride,
            this.attributes.offset
        );
    }

    draw()
    {
        let primitiveType = this.gl.TRIANGLES;
        let offset = 0;
        let count = 3;

        this.gl.drawArrays(primitiveType, offset, count);
    }
}