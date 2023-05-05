export class InstancedLineBuffer
{
    constructor(gl, programInfo, pointsData, lineStrip = true)
    {
        this.gl = gl;

        this.VAO = this.gl.createVertexArray();

        this.positionBuffer = this.gl.createBuffer();
        this.pointsBuffer = this.gl.createBuffer();

        this.programInfo = programInfo;

        this.bufferData = [
            0, -0.5,
            1, -0.5,
            1, 0.5,
            0, -0.5,
            1, 0.5,
            0, 0.5
        ];

        if (!pointsData && pointsData.length < 1) throw Error("Wrong line vertex array input!");
        this.pointsData = pointsData;


        this.attributesInfo = {
            position: {
                size : 2,
                type : this.gl.FLOAT,
                normalize : false,
                stride : 0,
                offset : 0
            },
            pointA: {
                size : 2,
                type : this.gl.FLOAT,
                normalize : false,
                stride : lineStrip ? 0 : Float32Array.BYTES_PER_ELEMENT*4,
                offset : Float32Array.BYTES_PER_ELEMENT * 0,
                divisor: 1
            },
            pointB: {
                size : 2,
                type : this.gl.FLOAT,
                normalize : false,
                stride : lineStrip ? 0 : Float32Array.BYTES_PER_ELEMENT*4,
                offset : Float32Array.BYTES_PER_ELEMENT * 2,
                divisor: 1
            }
        }

        this.drawSettings = {
            primitiveType: this.gl.TRIANGLES,
            offset: 0,
            count: this.bufferData.length/2,
            instances: lineStrip ? this.pointsData.length/2-1 : this.pointsData.length/4,
        }

        this.initialize();

    }

    initialize()
    {
        this.gl.bindVertexArray(this.VAO);

        this.setUpPositionBuffer(this.bufferData);
        this.setUpPointsBuffer(this.pointsData);
        //this.setUpIndicesBuffer(this.indiciesData);
    }


    setUpPositionBuffer(bufferData)
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.DYNAMIC_DRAW);

        const attribLoc = this.programInfo.attribLocations.vertexPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size,type,normalize,stride,offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer(attribLoc, size,type,normalize,stride,offset);
        this.gl.vertexAttribDivisor(attribLoc, 0);

        console.log(size);
    }

    setUpPointsBuffer(ptsBufferData)
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointsBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(ptsBufferData), this.gl.DYNAMIC_DRAW);

        // describe point A attribute
        let attribLoc = this.programInfo.attribLocations.pointA;
        this.gl.enableVertexAttribArray(attribLoc);
        let { size, type, normalize, stride, offset } = this.attributesInfo.pointA;
        this.gl.vertexAttribPointer(attribLoc, size, type, normalize, stride, offset);
        this.gl.vertexAttribDivisor(attribLoc, 1);

        // describe point B attribute
        attribLoc = this.programInfo.attribLocations.pointB;
        this.gl.enableVertexAttribArray(attribLoc);
        ({ size, type, normalize, stride, offset } = this.attributesInfo.pointB);
        this.gl.vertexAttribPointer(attribLoc, size, type, normalize, stride, offset);
        this.gl.vertexAttribDivisor(attribLoc, 1);
    }

    updatePositionBuffer(bufferData)
    {
        this.bufferData = bufferData;

        this.bindVertexArray(this.VAO);

        this.gl.bindBuffer = this.positionBuffer;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.DYNAMIC_DRAW);
    }

    createRoundBuffer(resolution)
    {
        const position = [0, 0];
        for (wedge = 0; wedge <= resolution; wedge++) {
        const theta = (2 * Math.PI * wedge) / resolution;
        position.push(0.5 * Math.cos(theta), 0.5 * Math.sin(theta));
        }
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
        this.gl.drawArraysInstanced(primitiveType ,0, count, instances);

        // Draw caps

    }
}