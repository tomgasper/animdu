import { CustomBuffer } from "../Primitives/CustomBuffer.js";
import { RenderableObject } from "../RenderableObject.js";
import { getProjectionMat } from "../utils.js";

export class UIViewport
{
    objects = [];

    width;
    height;
    bgColor;

    position = [0,0];

    appRef = undefined;

    constructor(appRef, UIRef, width, height, bgColor)
    {
        this.appRef = appRef;

        this.width = width;
        this.height = height;

        this.bgColor = bgColor;

        this.initViewport(UIRef, width, height, bgColor);
    }

    initViewport(UIRef, width,height,colour)
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
        const customBuffer = new CustomBuffer(this.appRef.gl, this.appRef.programs[0], data);
        const viewport = new RenderableObject(customBuffer.getInfo(), getProjectionMat(this.appRef.gl));

        viewport.setCanBeHighlighted(false);
        viewport.setCanBeMoved(false);
        viewport.setPosition(this.position);
        viewport.setOriginalColor(colour);

        viewport.updateWorldMatrix();
        
        this.objects.push(viewport);
    }
}