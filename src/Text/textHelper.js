import { m3 } from "../utils.js";
import { TextObject } from "./TextObject.js";
import { TextBuffer } from "./TextBuffer.js";

export function createNewText(gl, program, text, font, projectionMat)
{
    // Create text object
    const someTextBuffer = new TextBuffer(gl, program, font, text);
    someTextBuffer.initialize();
    const someTextBufferInfo = {
        bufferInfo: someTextBuffer.getBufferInfo(),
        vertexArrInfo: someTextBuffer.getVertexArrInfo(),
        drawInfo: someTextBuffer.getDrawInfo(),
        programInfo: program
    };

    const someTextProperties = {
        transform: [
            1,0,0,
            0,1,0,
            0,0,1
        ],
        font_tex: 0,
        sdf_tex_size: [someTextBuffer.font.texResolution[0], someTextBuffer.font.texResolution[1]],
        sdf_border_size: someTextBuffer.font.decoder.iy,
        hint_amount: 1.0,
        font_color: [0,0,0,1],
        subpixel_amount: 1.0
    };

    const txtObj = new TextObject(someTextBufferInfo, someTextProperties, projectionMat);

    return txtObj;
}