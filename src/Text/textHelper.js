import { m3 } from "../utils.js";

import { TextObject } from "./TextObject.js";
import { TextBuffer } from "./TextBuffer.js";

import { getProjectionMat } from "../utils.js";

export function createNewText(gl, program, text, textSize, font, txtColor)
{
    // Create text object
    const textBuffer = new TextBuffer(gl, program, font, text, textSize, txtColor);
    
    const textBufferInfo = {
        bufferInfo: textBuffer.getBufferInfo(),
        vertexArrInfo: textBuffer.getVertexArrInfo(),
        drawInfo: textBuffer.getDrawInfo(),
        programInfo: program
    };

    const textProperties = {
        txt_string: text,
        transform: [
            1,0,0,
            0,1,0,
            0,0,1
        ],
        font_tex: 0,
        sdf_tex_size: [textBuffer.font.texResolution[0], textBuffer.font.texResolution[1]],
        sdf_border_size: textBuffer.font.decoder.iy,
        hint_amount: 1.0,
        font_color: [0,0,0,1],
        subpixel_amount: 1.0
    };

    const txtObj = new TextObject(textBufferInfo, textBuffer, textProperties, getProjectionMat(gl));

    // Turn on blending as default
    txtObj.properties.blending = true;

    return txtObj;
}