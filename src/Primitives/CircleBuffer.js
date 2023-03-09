export class CircleBuffer {
    constructor(gl, programInfo, radius = 50, resolution = 9)
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

        this.bufferData = this.createSphereVertices(radius, resolution);

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

    initData()
    {
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.STATIC_DRAW);
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
        primitiveType: this.attributes.type,
        offset: this.attributes.offset,
        count: this.bufferData.length/this.attributes.size
    };

    return vertexArrInfo;
    }

    createSphereVertices(radius, resolution)
    {
        let step = (2*Math.PI)/resolution;
        let v_arr = [
            0,0,
            radius*1,0,
            radius*Math.cos(step), radius*Math.sin(step),
        ];

        const float_err = 0.001;

        for (let i = step; i <= 2*Math.PI + float_err; i = i + step )
        {
            // rotating [1,0] vector
            let x = radius*Math.cos(i);
            let y = radius*Math.sin(i);

            let new_trg = [
                        0,0,
                        v_arr[v_arr.length-2], v_arr[v_arr.length-1],
                        x,y
                        ];
        
            v_arr.push(...new_trg);
        }
        return v_arr;
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

    draw()
    {
        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;

        this.gl.drawArrays(primitiveType, offset, count);
    }
}