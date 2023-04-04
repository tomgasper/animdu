import { m3, computeTransform  } from "../utils.js"

export class GeometryObject
{
    // This class will actually allow to create "backend" for each object
    // We will be changing parameters of this object and then sending this new changed object
    // to the render pipeline
    
    constructor(renderInfo)
    {
        // ok this will be some object which points to proper buffer
        this.renderInfo = {
            bufferInfo: renderInfo.bufferInfo,
            vertexArrInfo: renderInfo.vertexArrInfo,
            drawInfo: renderInfo.drawInfo,
            programInfo: renderInfo.programInfo
        }
    }
}