import { m3, computeTransform  } from "../utils.js"
import { Node } from "../Node/Node.js"

export class GeometryObject extends Node
{
    // This class will actually allow to create "backend" for each object
    // We will be changing parameters of this object and then sending this new changed object
    // to the render pipeline
    renderInfo = {
        bufferInfo: undefined,
        vertexArrInfo: undefined,
        drawInfo: undefined,
        programInfo: undefined
    }
    
    constructor(renderInfo)
    {
        super();

        // ok this will be some object which points to proper buffer
        this.renderInfo = {
            bufferInfo: renderInfo.bufferInfo,
            vertexArrInfo: renderInfo.vertexArrInfo,
            drawInfo: renderInfo.drawInfo,
            programInfo: renderInfo.programInfo
        }
    }
}