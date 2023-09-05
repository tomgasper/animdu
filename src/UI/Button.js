import { RenderableObject } from "../RenderableObject.js";
import { UIObject } from "./UIObject.js";

export class Button extends UIObject
{

    constructor(appRef, fnc, size, colour)
    {
        super(appRef);

        this.initialize(fnc, size, colour);
    }

    initialize(fnc, size = [0.2,0.2], colour = [0.6,0.3,0.2,1])
    {
        const primitiveBuffers = this._ref.app.primitiveBuffers;

        const rect = new RenderableObject(primitiveBuffers.rectangle);
        this.container = rect;

        rect.setScale(size);
        rect.setOriginalColor(colour);
        rect.setOnClick(fnc);
        rect.setCanBeMoved(false);
        rect.setCanBeHighlighted(true);
    }

    setOnClick(fnc)
    {
        this.container.setOnClick(fnc);
    }
}