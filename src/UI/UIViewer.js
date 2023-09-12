import { RenderableObject } from "../RenderableObject.js";
import { UIObject } from "./UIObject.js";
import { CustomBuffer } from "../Primitives/CustomBuffer.js";

export class UIViewer extends UIObject
{
    constructor(appRef, buffInfo, name, dims, colour)
    {
        // dims = [ (float)left, (float)right, (float)top, (float)bottom ]
        super(appRef, buffInfo);

        this.setName(name);

        this.initialize(colour);
    }

    initialize(colour)
    {
        // this.container = this.createContainer(dims);

        this.setStyle(colour);
    }

    setName(name)
    {
        if (typeof name !== "string") throw new Error("Incorrect name type!");
        this.name = name;
    }

    setStyle(colour = [0.4,0.3,0.2,1])
    {
        if (!(this instanceof RenderableObject)) throw new Error("Incorrect/No container object!");
        this.setOriginalColor(colour);
        this.canBeMoved = false;
        this.properties.highlight = false;
        this.setColor([0,0.3,0.2,1]);
        this.properties.originalColor = [0, 0.02, 0.04, 1];

        this.style.colour = colour;
    }

    createContainer(dims)
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


    const customRectBuffer = new CustomBuffer(this._ref.app.gl, this._ref.app.programs[0], customVertsPos);
    const customRectBufferInfo = customRectBuffer.getInfo();

    const customRect = new RenderableObject(customRectBufferInfo);
    customRect.canBeMoved = false;
    customRect.properties.highlight = false;
    customRect.setColor([0,0.3,0.2,1]);
    customRect.properties.originalColor = [0, 0.02, 0.04, 1];

    return customRect;
    }
}