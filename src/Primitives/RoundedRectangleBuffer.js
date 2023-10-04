export class RoundedRectangleBuffer {
    constructor(gl, programInfo)
    {
         // Make gl object local
         this.gl = gl;

         // Vertex Array for this class
         this.VAO = this.gl.createVertexArray();
 
         // Buffers to hold data for this class
         this.buffer = this.gl.createBuffer();
     
         this.programInfo = programInfo;

         this.basicQuadVerts = [
            -50, -50,
            50, -50,
            -50, 50,

            -50, 50,
            50,-50,
            50,50
        ];

         this.textureData = undefined;
 
         this.attributesInfo = {
             vertexPosition : {
                 size : 2,
                 type : gl.FLOAT,
                 normalize : false,
                 stride : 7,
                 offset : 0
             },
             upperLeft: {
                 size : 2,
                 type : gl.FLOAT,
                 normalize : false,
                 stride : 7,
                 offset : 0
             },
             widthHeight: {
                size : 2,
                type : gl.FLOAT,
                normalize : false,
                stride : 7,
                offset : 0
            },
            cornerRadius: {
                size : 1,
                type : gl.FLOAT,
                normalize : false,
                stride : 7,
                offset : 0
            },
            /*
            color: {
                size : 1,
                type : gl.FLOAT,
                normalize : false,
                stride : 0,
                offset : 0
            }
            */
         }
 
         this.drawSettings = {
             primitiveType: gl.TRIANGLES,
             offset: 0,
             count: 6
         }

         this.initialize(gl);
        }
     
    
    initialize(gl)
    {
        this.gl.bindVertexArray(this.VAO);

        // set custom size
        // if (size && size.length == 2)
        // {

        // create bufffers, bind them, upload data, specify layout
        this.setUpMainBuffer(gl);

        /*
        if (textureSrc)
        {
            this.setUpTextureBuffer(this.textureSrc);
        }
        */
    }   

    setUpMainBuffer(gl)
    {
        // Create a buffer and upload the rectangle data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

        // Flatten the rectangle data into a single array and upload it to the buffer
        let rectangleData = [];

        const width = 1.;
        const height = 1.;
        const cornRadius = 0.05;

        // 6 vertices to render quad
        for (let i = 0; i < 6; i++)
        {
            rectangleData.push(this.basicQuadVerts[2*i], this.basicQuadVerts[2*i+1],
                              0,0,
                              1,1,
                              cornRadius
                              );
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectangleData), gl.STATIC_DRAW);

        // Get the locations of the attributes in your shader
        let positionLoc = this.programInfo.attribLocations.vertexPosition;
        let upperLeftLoc = this.programInfo.attribLocations.upperLeft;
        let widthHeightLoc = this.programInfo.attribLocations.widthHeight;
        let cornerRadiusLoc = this.programInfo.attribLocations.cornerRadius;

        // Set up the vertex attribute pointers
        let stride = 7 * Float32Array.BYTES_PER_ELEMENT;
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(upperLeftLoc);
        gl.vertexAttribPointer(upperLeftLoc, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(widthHeightLoc);
        gl.vertexAttribPointer(widthHeightLoc, 2, gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(cornerRadiusLoc);
        gl.vertexAttribPointer(cornerRadiusLoc, 1, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);
    }

    getInfo()
    {
        const bufferInfo = {
            bufferInfo: {
                position : this.buffer,
                texture : this.textureBuffer
            },
            vertexArrInfo: {
                VAO : this.VAO,
                primitiveType: this.attributesInfo.type,
                offset: this.attributesInfo.offset}
            ,
            drawInfo: {
                primitiveType: this.drawSettings.primitiveType,
                offset: this.drawSettings.offset,
                count: this.drawSettings.count,
                drawCall: this.draw.bind(this)
            },
            programInfo: this.programInfo
        }

        return bufferInfo;
    }

    draw()
    {
        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;

        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.drawArrays( primitiveType, offset, count);
        // this.gl.drawElements(primitiveType , count, this.gl.UNSIGNED_SHORT, offset);
    }
}
