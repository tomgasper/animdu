import { CustomBuffer } from '../Primitives/CustomBuffer';
import { UIObject } from './UIObject';

export class UISceneViewport extends UIObject
{
    position = [0,0];

    appRef = undefined;

    constructor(appRef, size, colour)
    {
        super(appRef, undefined);

        this.width = size[0];
        this.height = size[1];
        this.style.colour = colour;

        this.initViewport(this.width, this.height, colour);
    }

    
    initViewport(width,height,colour)
    {
        const data = [
            0,0,
            width,0,
            width, height,

            width,height,
            0, height,
            0, 0
        ];

        // create new objects that garbage collector will hopefully delete when it's time to go
        const customBuffer = new CustomBuffer(this._ref.app.gl, this._ref.app.programs[0], data);
        this.setBuffer(customBuffer);

        this.setCanBeHighlighted(false);
        this.setCanBeMoved(false);
        this.setOriginalColor(colour);
        this.updateWorldMatrix();

    }

    createContainerVerts(dims)
    {
    const [ left, right, top, bottom ] = dims;
        // Install Container
    const customVertsPos = [  left, top,
    right, top,
    right, bottom,
    
    right, bottom,
    left, bottom,
    left, top
    ];

    return customVertsPos;
    }

    updateContainer(dims)
    {
        const newVerts = this.createContainerVerts(dims);
        this.buffer.updatePositionBuffer(newVerts);
    }
}