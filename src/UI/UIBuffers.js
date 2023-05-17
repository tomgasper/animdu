import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";
import { CircleBuffer } from "../Primitives/CircleBuffer.js";

export class UIBuffers
{
    UINode = {
        container:{
            buffer: undefined,
            size: [],
        },
        textInput: {
            buffer: undefined,
            size: [],
        },
        handle: {
            buffer: undefined,
            size: undefined,
        }
    };

    constructor()
    {

    }

    createUINodeBuffers(gl, program, size, roundness = 0.05)
    {
        this.UINode.container.size = size;
        this.UINode.container.buffer = new RectangleBuffer(gl, program, size, roundness);

        // Text input size proportional to the nodes container
        const textInputSize = [size[0]*0.3, size[1]*0.15];
        this.UINode.textInput.size = textInputSize;
        this.UINode.textInput.buffer = new RectangleBuffer(gl, program, textInputSize, roundness);

        const handleResolution = 16;
        const handleSize = size[1]*0.05;
        this.UINode.handle.size = handleSize;
        this.UINode.handle.buffer = new CircleBuffer(gl, program, handleSize, handleResolution);

        return this.UINode;
    }

    getContainer()
    {
        if (this.container) return this.container;
    }
}