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
            size: [],
        },
        sliderCircle: {
            buffer: undefined,
            size: []
        },
        sliderBg: {
            buffer: undefined,
            size: []
        }
    };


    UILayerInfo = {
        container:{
            buffer: undefined,
            size: [],
        },
        deleteButton:
        {
            buffer: undefined,
            size: []
        }
    }

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

        // Slider buffers
        const sliderBgSize = [size[0]*0.8, size[1]*0.15];
        this.UINode.sliderBg.size = sliderBgSize;
        this.UINode.sliderBg.buffer = new RectangleBuffer(gl, program, sliderBgSize, 0.3);

        const sliderCirclerRes = 16;
        const sliderCircleSize = size[1] * 0.05;
        this.UINode.sliderCircle.size = handleSize;
        this.UINode.sliderCircle.buffer = new CircleBuffer(gl, program, sliderCircleSize, sliderCirclerRes);

        return this.UINode;
    }

    createUILayerBuffers(gl, program, size, roundness = 0.0)
    {
        this.UILayerInfo.container.size = size;
        this.UILayerInfo.container.buffer = new RectangleBuffer(gl, program, size, roundness);

        this.UILayerInfo.deleteButton.size = [size[0]/5, size[1]];
        this.UILayerInfo.deleteButton.buffer = new CircleBuffer(gl, program, size[1]/2, 16);

        return this.UILayerInfo;
    }

    getContainer()
    {
        if (this.container) return this.container;
    }
}