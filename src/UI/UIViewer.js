import { RenderableObject } from "../RenderableObject.js";
import { UIObject } from "./UIObject.js";
import { CustomBuffer } from "../Primitives/CustomBuffer.js";

import { Component } from "./Node/Component.js";

import { hexToRgb } from "../utils.js";

export class UIViewer extends UIObject
{
    components = [];

    style = {
        ...this.style,
        container: {
            colour: undefined
        },
    }

    constructor(appRef, UIRef, buffInfo, name)
    {
        // dims = [ (float)left, (float)right, (float)top, (float)bottom ]

        super(appRef, buffInfo);

        // need to save ref to UI manually as UI instance isn't attached to App instance yet
        this._ref.UI = UIRef;

        this.setName(name);

        this.initialize();
    }

    initialize()
    {
        this.style.container.colour = hexToRgb(this._ref.UI.style.nodeViewer.container.colour);

        this.setStyle(this.style.container.colour);
    }

    setName(name)
    {
        if (typeof name !== "string") throw new Error("Incorrect name type!");
        this.name = name;
    }

    setStyle(colour)
    {
        if (!(this instanceof RenderableObject)) throw new Error("Incorrect/No container object!");
        this.setOriginalColor(colour);
        this.canBeMoved = false;
        this.properties.highlight = false;
        // this.setColor([0,0.3,0.2,1]);

        this.style.colour = colour;
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

    addComponent(component)
    {
        if (!(component instanceof Component)) throw Error("Incorrect Component type!");
        this.components.push(component);
    }
}