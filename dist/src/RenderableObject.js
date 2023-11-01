import { GeometryObject } from "./GeometryObject.js";
export class RenderableObject extends GeometryObject {
    constructor(objBuffer, extraParams) {
        super();
        /*
        renderInfo = {
            bufferInfo: undefined,
            vertexArrInfo: undefined,
            drawInfo: undefined,
            programInfo: undefined
        };
        */
        this.buffer = {};
        if (objBuffer === undefined) {
            this.buffer = undefined;
        }
        else {
            this.setBuffer(objBuffer);
        }
        if (extraParams) {
            this.properties = Object.assign(Object.assign({}, this.properties), extraParams);
        }
    }
    setBuffer(objBuffer) {
        if (!objBuffer || !objBuffer.getInfo())
            throw new Error("Setting incorrect buffer!");
        this.buffer = objBuffer;
        this.buffer.renderInfo = objBuffer.getInfo();
    }
    addExtraParam(extraParam) {
        this.properties = Object.assign(Object.assign({}, this.properties), extraParam);
    }
}
//# sourceMappingURL=RenderableObject.js.map