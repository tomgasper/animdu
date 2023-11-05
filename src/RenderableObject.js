import { GeometryObject } from "./GeometryObject.js";

export class RenderableObject extends GeometryObject
{
    /*
    renderInfo = {
        bufferInfo: undefined,
        vertexArrInfo: undefined,
        drawInfo: undefined,
        programInfo: undefined
    };
    */

    buffer = {};
    name;
    
    constructor(objBuffer, extraParams)
    {
        super();

        if (objBuffer === undefined)
        {
            this.buffer = undefined;
        } else {
            this.setBuffer(objBuffer);
        }

        if (extraParams)
        {
            this.addExtraParam(extraParams);
        }
    }

    setBuffer(objBuffer)
    {
        if (!objBuffer || !objBuffer.getInfo() ) throw new Error("Setting incorrect buffer!");

        this.buffer = objBuffer;
        this.buffer.renderInfo = objBuffer.getInfo();
    }

    addExtraParam(extraParams)
    {
        this.properties = {
            ...this.properties, ...extraParams
        }
    }

    setName(name)
    {
        this.name = name;
    }
}