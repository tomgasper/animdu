import { CustomBuffer } from "../Primitives/CustomBuffer.js";
import { RenderableObject } from "../RenderableObject.js";
import { getProjectionMat } from "../utils.js";
import { UIObject } from "./UIObject.js";

export class UIViewport extends UIObject
{
    position = [650,0];

    appRef = undefined;

    constructor(appRef, buffInfo, size, colour)
    {
        super(appRef, buffInfo);

        this.width = size[0];
        this.height = size[1];
        this.style.colour = colour;

    this.initViewport(colour);
    }

    /*
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
        const viewport = new RenderableObject(customBuffer.getInfo());

        this.container = viewport;

        viewport.setCanBeHighlighted(false);
        viewport.setCanBeMoved(false);
        // viewport.setPosition(this.position);
        viewport.setOriginalColor(colour);
        viewport.updateWorldMatrix();
    }
    */

    initViewport(colour)
    {
        this.setCanBeHighlighted(false);
        this.setCanBeMoved(false);
        // viewport.setPosition(this.position);
        this.setOriginalColor(colour);
        this.updateWorldMatrix();
    }
}