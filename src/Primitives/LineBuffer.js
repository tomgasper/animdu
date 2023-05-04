export class LineBuffer
{
    constructor(gl, programInfo)
    {
        this.gl = gl;

        this.VAO = this.gl.createVertexArray();

        this.positionBuffer = this.gl.createBuffer();
        this.programInfo = programInfo;

        this.bufferData = [0,0,100,100];

        this.attributesInfo = {
            position: {
                size : 2,
                type : this.gl.FLOAT,
                normalize : false,
                stride : 0,
                offset : 0
            }
        }

        this.drawSettings = {
            primitiveType: this.gl.LINES,
            offset: 0,
            count: this.bufferData.length/2
        }

    }

    initialize()
    {
        this.bindVertexArray(this.VAO);

        this.setUpPositionBuffer(this.bufferData);
    }

    setUpPositionBuffer(bufferData)
    {
        this.gl.bindBuffer = this.positionBuffer;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.DYNAMIC_DRAW);

        const attribLoc = this.programInfo.attribLocations.vertexPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size,type,normalize,stride,offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer(attribLoc, size,type,normalize,stride,offset);
    }

    updatePositionBuffer(bufferData)
    {
        this.bufferData = bufferData;

        this.bindVertexArray(this.VAO);

        this.gl.bindBuffer = this.positionBuffer;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.DYNAMIC_DRAW);
    }
    
    getInfo()
    {
        const bufferInfo = {
            bufferInfo: {
                position: this.positionBuffer
            },
            vertexArrInfo: {
                VAO: this.VAO,
                primitiveType: this.attributesInfo.type,
            },
            drawInfo: {
                primitiveType: this.drawSettings.primitiveType,
                offset: this.drawSettings.offset,
                count: this.drawSettings.count,
                drawCall: this.draw.bind(this)
            },
            programInfo: this.programInfo
        };

    return bufferInfo;
    }
    
    draw()
    {
        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;

        this.gl.drawArrays(primitiveType , offset, count);
    }
}