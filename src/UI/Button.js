import { RenderableObject } from '../RenderableObject';
import { UIObject } from './UIObject';

export class Button extends UIObject
{

    constructor(appRef, buffInfo, fnc, size, colour)
    {
        super(appRef, buffInfo);

        //this.initialize(fnc, size, colour);
        this.setStyle(size,colour);
        this.setOnClick(fnc);
    }

    initialize(fnc, size = [0.2,0.2], colour = [0.6,0.3,0.2,1])
    {
        /*
        const primitiveBuffers = this._ref.app.primitiveBuffers;

        const rect = new RenderableObject(primitiveBuffers.rectangle);
        this.container = rect;

        rect.setScale(size);
        rect.setOriginalColor(colour);
        rect.setOnClick(fnc);
        rect.setCanBeMoved(false);
        rect.setCanBeHighlighted(true);
        */
    }

    setStyle(size = [0.2,0.2],colour)
    {
        this.setScale(size);
        this.setOriginalColor(colour);
        this.setCanBeMoved(false);
        this.setCanBeHighlighted(true);
    }

    /*
    setOnClick(fnc)
    {
        this.setOnClick(fnc);
    }
    */
    
}