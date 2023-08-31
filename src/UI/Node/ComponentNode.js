// to do

import { RectangleBuffer } from "../../Primitives/RectangleBuffer.js";
import { RenderableObject } from "../../RenderableObject.js";
import { getProjectionMat } from "../../utils.js";
import { UIObject } from "../UIObject.js";

import { ParamNode } from "./ParamNode.js";
import { FunctionNode } from "./FunctionNode.js";
import { Button } from "../Button.js";

export class ComponentNode extends UIObject
{
    nodes = [];

    constructor(app, size)
    {
        super(app.UI);

        this.appRef = app;

        this.initialize(size);

        console.log("THIS IS HOW A COMPONENT NODE LOOKS LIKE:")
        console.log(this);
    }

    initialize(size = [700, 350])
    {
        const [sizeX, sizeY] = size;

        const rect = new RenderableObject(this.appRef.primitiveBuffers.rectangle);
        rect.setScale([sizeX/100,sizeY/100]);

        // Save ref
        this.container = rect;

        // Add button
        const newButton = new Button(this.appRef, () => console.log("Hello!"));
        newButton.setParent(this.container);
        newButton.setPosition([sizeX/2 - sizeX*0.1,-sizeY/2 + sizeY * 0.1]);

        this.addObjsToRender([rect, ...newButton.getObjsToRender()]);
    }

    addParamNode(type, params)
    {
        const newNode = new ParamNode(this.appRef, type, params);
        newNode.initialize();
        newNode.setParent(this.container);

        this.nodes.push(newNode);

        this.addObjsToRender(newNode.getObjsToRender());

        // Add to UI elements to render
        // this.appRef.UI.addObj(newNode.getObjsToRender(), ["nodes"]);
    }

    addFunctionNode(effectorFnc)
    {
        const newNode = new FunctionNode(this.appRef, effectorFnc);
        newNode.initialize();
        newNode.setParent(this.container);

        this.nodes.push(newNode);

        this.addObjsToRender(newNode.getObjsToRender());
    }
}