import { RectangleBuffer } from '../Primitives/RectangleBuffer';
import { CircleBuffer } from '../Primitives/CircleBuffer';
import { RoundedRectangleBuffer } from '../Primitives/RoundedRectangleBuffer';

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

    ObjNode = {
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

    createUINodeBuffers(gl, programs, size, roundness = 0.05)
    {
        this.UINode.container.size = size;
        // this.UINode.container.buffer = new RectangleBuffer(gl, program, size, roundness);
        this.UINode.container.buffer = new RoundedRectangleBuffer(gl, programs[5]);

        // Text input size proportional to the nodes container
        const textInputSize = [size[0]*0.3, size[1]*0.15];
        this.UINode.textInput.size = textInputSize;
        this.UINode.textInput.buffer = new RectangleBuffer(gl, programs[0], textInputSize, roundness);

        const handleResolution = 16;
        const handleSize = 5;
        this.UINode.handle.size = handleSize;
        this.UINode.handle.buffer = new CircleBuffer(gl, programs[0], handleSize, handleResolution);

        // Slider buffers
        const sliderBgSize = [size[0]*0.8, size[1]*0.15];
        this.UINode.sliderBg.size = sliderBgSize;
        this.UINode.sliderBg.buffer = new RectangleBuffer(gl, programs[0], sliderBgSize, 0.3);

        const sliderCirclerRes = 16;
        const sliderCircleSize = size[1] * 0.05;
        this.UINode.sliderCircle.size = handleSize;
        this.UINode.sliderCircle.buffer = new CircleBuffer(gl, programs[0], sliderCircleSize, sliderCirclerRes);

        return this.UINode;
    }

    createObjNodeBuffers(gl, programs, size, roundness = 0.05)
    {
        this.ObjNode.container.size = size;
        this.ObjNode.container.buffer = new RectangleBuffer(gl, programs[0], size, roundness);

        // Text input size proportional to the nodes container
        const textInputSize = [size[0]*0.3, size[1]*0.15];
        this.ObjNode.textInput.size = textInputSize;
        this.ObjNode.textInput.buffer = new RectangleBuffer(gl, programs[0], textInputSize, roundness);

        const handleResolution = 16;
        const handleSize = 5;
        this.ObjNode.handle.size = handleSize;
        this.ObjNode.handle.buffer = new CircleBuffer(gl, programs[0], handleSize, handleResolution);

        // Slider buffers
        const sliderBgSize = [size[0]*0.8, size[1]*0.15];
        this.ObjNode.sliderBg.size = sliderBgSize;
        this.ObjNode.sliderBg.buffer = new RectangleBuffer(gl, programs[0], sliderBgSize, 0.3);

        const sliderCirclerRes = 16;
        const sliderCircleSize = size[1] * 0.2;
        this.ObjNode.sliderCircle.size = handleSize;
        this.ObjNode.sliderCircle.buffer = new CircleBuffer(gl, programs[0], sliderCircleSize, sliderCirclerRes);

        return this.ObjNode;
    }

    createUILayerBuffers(gl, program, size, roundness = 0.0)
    {
        this.UILayerInfo.container.size = size;
        this.UILayerInfo.container.buffer = new RectangleBuffer(gl, program, size, roundness);

        this.UILayerInfo.deleteButton.size = [size[0]/5, size[1]];
        this.UILayerInfo.deleteButton.buffer = new CircleBuffer(gl, program, size[1]/2, 16);

        return this.UILayerInfo;
    }
}