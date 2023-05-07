export class InstancedLineCapBuffer
{
    constructor(gl, programInfo, pointsData)
    {
        this.gl = gl;

        this.VAO = this.gl.createVertexArray();

        this.positionBuffer = this.gl.createBuffer();
        this.pointsBuffer = this.gl.createBuffer();

        this.programInfo = programInfo;

        this.positionData = this.createRoundBuffer(16);

        this.pointsData = pointsData;

        this.attributesInfo = {
            position: {
                size : 2,
                type : this.gl.FLOAT,
                normalize : false,
                stride : 0,
                offset : 0
            },
            point: {
                size : 2,
                type : this.gl.FLOAT,
                normalize : false,
                stride : 0,
                offset : Float32Array.BYTES_PER_ELEMENT * 2,
                divisor: 1
            }
        }

        this.drawSettings = {
            primitiveType: this.gl.TRIANGLE_FAN,
            offset: 0,
            count: this.positionData.length/2,
            instances: this.pointsData.length/2 - 1
        }

        this.initialize();

    }

    initialize()
    {
        this.gl.bindVertexArray(this.VAO);

        this.setUpPositionBuffer(this.positionData);
        this.setUpPointsBuffer(this.pointsData);
        //this.setUpIndicesBuffer(this.indiciesData);
    }


    setUpPositionBuffer(positionData)
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positionData), this.gl.DYNAMIC_DRAW);

        const attribLoc = this.programInfo.attribLocations.vertexPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size,type,normalize,stride,offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer(attribLoc, size,type,normalize,stride,offset);
        this.gl.vertexAttribDivisor(attribLoc, 0);
    }

    setUpPointsBuffer(ptsBufferData)
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(ptsBufferData), this.gl.DYNAMIC_DRAW);

        // describe point A attribute
        let attribLoc = this.programInfo.attribLocations.point;
        this.gl.enableVertexAttribArray(attribLoc);
        let { size, type, normalize, stride, offset } = this.attributesInfo.point;
        this.gl.vertexAttribPointer(attribLoc, size, type, normalize, stride, offset);
        this.gl.vertexAttribDivisor(attribLoc, 1);
    }

    updatePositionBuffer(pointsData)
    {
        if (pointsData.length < 1 ) throw Error("Wrong input data!");
        this.pointsData = pointsData;

        this.bindVertexArray(this.VAO);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.pointsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.pointsData), this.gl.DYNAMIC_DRAW);
    }

    createRoundBuffer(resolution)
    {
        const position = [0, 0];
        for (let wedge = 0; wedge <= resolution; wedge++) {
        const theta = (2 * Math.PI * wedge) / resolution;
        position.push(0.5 * Math.cos(theta), 0.5 * Math.sin(theta));
        }

        return position;
    }
    
    getInfo()
    {
        const bufferInfo = {
            bufferInfo: {
                position: this.positionBuffer,
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
        let count = this.drawSettings.count;
        let instances = this.drawSettings.instances;

        //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiciesBuffer);

        // Draw lines
        this.gl.drawArraysInstanced(primitiveType , 0, count, instances);

        // Draw caps
        
    }
}