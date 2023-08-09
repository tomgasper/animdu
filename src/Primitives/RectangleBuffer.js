export class RectangleBuffer {
    constructor(gl, programInfo, size, rounded = undefined, textureSrc)
    {
         // Make gl object local
         this.gl = gl;

         // Vertex Array for this class
         this.VAO = this.gl.createVertexArray();
 
         // Buffers to hold data for this class
         this.positionBuffer = this.gl.createBuffer();
         this.indiciesBuffer = this.gl.createBuffer();
         // this.textureBuffer = this.gl.createBuffer();
     
         this.programInfo = programInfo;
 
         this.bufferData = [
            -50, -50,
            50,-50,
            50,50,
            -50, 50
         ]

         this.indiciesData = [
            0,1,2,
            2,3,0
        ]
         this.textureData = undefined;
 
         this.attributesInfo = {
             position : {
                 size : 2,
                 type : gl.FLOAT,
                 normalize : false,
                 stride : 0,
                 offset : 0
             },
             indices: {
                 size : this.indiciesData.length,
                 type : gl.UNSIGNED_SHORT,
                 normalize : false,
                 stride : 0,
                 offset : 0
             }
         }
 
         this.drawSettings = {
             primitiveType: gl.TRIANGLES,
             offset: 0,
             count: this.attributesInfo.indices.size
         }

         this.initialize(size, rounded, textureSrc);
     }
    
    initialize(size, rounded, textureSrc)
    {
        this.gl.bindVertexArray(this.VAO);

        // set custom size
        if (size && size.length == 2)
        {
            this.bufferData = [
                0, 0,
                size[0], 0,
                size[0], size[1],
                0, size[1]
            ];

            if (rounded)
            {
                
                // console.log(this.bufferData);

                const mult = size[1] / size[0];

                const o_x = mult*size[0]*rounded;
                const o_y = size[1]*rounded;

                const corners = [
                    [ [0,0+o_y], [0,0], [o_x, 0], 4 ],
                    [ [size[0]-o_x, 0], [size[0], 0], [size[0], 0+o_y], 7],
                    [ [size[0], size[1]-o_y], [size[0], size[1]], [size[0]-o_x, size[1]], 10],
                    [ [0+o_x, size[1]], [0, size[1]], [0, size[1]-o_y],9]
                ];

                const part_x = size[0]/3;
                const part_y = size[1]/3;

                const verts = [
                    0, 2 * part_y,
                    0, 1 * part_y,
                    3 * part_x, 1 * part_y,
                    3 * part_x, 2 * part_y,

                    1 * part_x, 1 * part_y,
                    1 * part_x, 0,
                    2 * part_x, 0,
                    2 * part_x, 1 * part_y,

                    1 * part_x, 3 * part_y,
                    1 * part_x, 2 * part_y,
                    2 * part_x, 2 * part_y,
                    2 * part_x, 3 * part_y,

                    // corners
                    0, o_y,
                    o_x, 0,

                    3*part_x-o_x, 0,
                    3*part_x, o_y,

                    3*part_x, 3*part_y-o_y,
                    3*part_x-o_x, 3*part_y,

                    o_x, 3*part_y,
                    0, 3*part_y-o_y

                ];

                this.bufferData = verts;

                this.indiciesData = [
                    0,1,2,
                    2,3,0,
                    4,5,6,
                    6,7,4,
                    8,9,10,
                    10,11,8,
                    
                    4,1,12,
                    4,13,5,

                    7,6,14,
                    2,7,15,

                    10,3,16,
                    11,10,17,

                    8,18,9,
                    9,19,0

                ];

                this.calcRoundedCorners(corners);

                this.attributesInfo.indices.size = this.indiciesData.length;
                this.drawSettings.count = this.indiciesData.length;
            }
        }

        // create bufffers, bind them, upload data, specify layout
        this.setUpPositionBuffer();
        this.setUpIndicesBuffer();

        if (textureSrc)
        {
            this.setUpTextureBuffer(this.textureSrc);
        }
    }

    calcRoundedCorners(corners)
    {
        const data = [];

        corners.forEach((c) => {
            // typical bezier curve

            this.bufferData.push(c[0][0], c[0][1]);
            
            for (let t = 0.1; t <= 1; t += 0.1)
            {
                let p = [0,0];
                p[0] = c[1][0] + Math.pow(1-t,2)*(c[0][0]-c[1][0]) + Math.pow(t,2)*(c[2][0] - c[1][0]);
                p[1] = c[1][1] + Math.pow(1-t,2)*(c[0][1]-c[1][1]) + Math.pow(t,2)*(c[2][1] - c[1][1]);
                this.bufferData.push(p[0],p[1]);

                this.indiciesData.push(c[3], (this.bufferData.length/2) - 2, (this.bufferData.length/2)-1 );
            }
        });

        //this.bufferData.push(data);
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

    setUpIndicesBuffer()
    {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiciesBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indiciesData), this.gl.STATIC_DRAW);
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

    getInfo()
    {
        const bufferInfo = {
            bufferInfo: {
                position : this.positionBuffer,
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
        };

        return bufferInfo;
    }

    draw()
    {
        let primitiveType = this.drawSettings.primitiveType;
        let offset = this.drawSettings.offset;
        let count = this.drawSettings.count;

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indiciesBuffer);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.drawElements(primitiveType , count, this.gl.UNSIGNED_SHORT, offset);
    }
}
