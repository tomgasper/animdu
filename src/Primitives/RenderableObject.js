import { m3, computeTransform  } from "../utils.js"
import { Node } from "../Node/Node.js"
import { SceneObject } from "../SceneObject.js";

export class RenderableObject extends SceneObject
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

    buffer = {};
    
    constructor(renderInfo, projection, buffer = undefined)
    {
        super();

        this.buffer = buffer;

        if (typeof projection === undefined || projection.length != 9) throw new Error("[SceneObject]: Wrong input projection matrix!");
        this.setProjection(projection);

        // ok this will be some object which points to proper buffer
        this.renderInfo = {
            bufferInfo: renderInfo.bufferInfo,
            vertexArrInfo: renderInfo.vertexArrInfo,
            drawInfo: renderInfo.drawInfo,
            programInfo: renderInfo.programInfo
        }
    }
}