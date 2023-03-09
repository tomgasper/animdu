export class TriangleObject
{
    // This class will actually allow to create "backend" for each object
    // We will be changing parameters of this object and then sending this new changed object
    // to the render pipeline
    constructor(bufferInfo, vertexArrInfo, drawInfo, programInfo)
    {
        // ok this will be some object which points to proper buffer
        this.bufferInfo = bufferInfo;
        this.vertexArrInfo = vertexArrInfo;
        this.drawInfo = drawInfo;
        this.programInfo = programInfo;

        // local copy of shader for this object
        
        this.color = [0.5, 0.7, 0.2, 1];

        this.position = [0,0];
        this.scale = [1,1];
        this.rotation = 0;
        this.origin = [0,0];

        this.transform =
        [ 1, 0, 0,
          0, 1, 0,
          0, 0, 1
        ];

        this.projection;
        // I need the way to identify which buffer to pass this data into so I can see
        // this ting on screen
    }
}