export class LineBuffer {
    constructor(gl, programInfo, A, B, width = 5) {
        this.gl = gl;
        this.VAO = this.gl.createVertexArray();
        this.positionBuffer = this.gl.createBuffer();
        this.indiciesBuffer = this.gl.createBuffer();
        this.programInfo = programInfo;
        this.bufferData = [];
        this.indiciesData = [];
        // Calculate data
        if (A.length !== 2 || B.length !== 2)
            throw Error("Wrong Line Buffer Input!");
        this.calcLine(A, B, width);
        this.attributesInfo = {
            position: {
                size: 2,
                type: this.gl.FLOAT,
                normalize: false,
                stride: 0,
                offset: 0
            },
            indicies: {
                size: this.indiciesData.length,
                type: this.gl.UNSIGNED_SHORT,
                normalize: false,
                stride: 0,
                offset: 0
            }
        };
        this.drawSettings = {
            primitiveType: this.gl.TRIANGLES,
            offset: 0,
            count: this.indiciesData.length
        };
        this.initialize();
    }
    initialize() {
        this.gl.bindVertexArray(this.VAO);
        this.setUpPositionBuffer(this.bufferData);
        this.setUpIndicesBuffer(this.indiciesData);
    }
    calcLine(A, B, width) {
        // normal vector
        const vec = [B[0] - A[0], B[1] - A[1]];
        let normVec = [-vec[1], vec[0]];
        const length = Math.sqrt(normVec[0] * normVec[0] + normVec[1] * normVec[1]);
        normVec = [normVec[0] / length, normVec[1] / length];
        const o_x = normVec[0] * width;
        const o_y = normVec[1] * width;
        // add vertices
        const v1 = [A[0] + o_x, A[1] + o_y];
        const v2 = [A[0] - o_x, A[1] - o_y];
        const v3 = [B[0] + o_x, B[1] + o_y];
        const v4 = [B[0] - o_x, B[1] - o_y];
        this.bufferData = [v1[0], v1[1],
            v2[0], v2[1],
            v3[0], v3[1],
            v4[0], v4[1]];
        console.log(this.bufferData);
        // add inidicies
        this.indiciesData = [
            0, 2, 1,
            1, 2, 3
        ];
    }
    setUpPositionBuffer(bufferData) {
        console.log(bufferData);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.DYNAMIC_DRAW);
        const attribLoc = this.programInfo.attribLocations.vertexPosition;
        this.gl.enableVertexAttribArray(attribLoc);
        const { size, type, normalize, stride, offset } = this.attributesInfo.position;
        this.gl.vertexAttribPointer(attribLoc, size, type, normalize, stride, offset);
        console.log(size);
    }
    setUpIndicesBuffer(indiciesData) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiciesBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indiciesData), this.gl.DYNAMIC_DRAW);
    }
    updatePositionBuffer(bufferData) {
        this.bufferData = bufferData;
        this.bindVertexArray(this.VAO);
        this.gl.bindBuffer = this.positionBuffer;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferData), this.gl.DYNAMIC_DRAW);
    }
    getInfo() {
        const bufferInfo = {
            bufferInfo: {
                position: this.positionBuffer,
                indicies: this.indiciesBuffer
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
    draw() {
        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiciesBuffer);
        this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, offset);
    }
}
//# sourceMappingURL=LineBuffer.js.map