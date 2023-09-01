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
    elements = {
        nodes: {
            IN: [],
            function: [],
            OUT: [],
        }
    }

    constructor(appRef, size, colour, name = "New component")
    {
        super(appRef);

        this.initialize(size);
        this.setName(name);

        console.log("THIS IS HOW A COMPONENT NODE LOOKS LIKE:")
        console.log(this);
    }

    initialize(size = [700, 350], colour = [0.1,0.1,0.1,1])
    {
        const [sizeX, sizeY] = size;

        const rect = new RenderableObject(this._ref.app.primitiveBuffers.rectangle);
        rect.setScale([sizeX/100,sizeY/100]);
        rect.setOriginalColor(colour);

        // Save ref and connect to UIViewer
        this.container = rect;
        this.container.setParent(this._ref.UI.viewer.container);


        this.container.name = "NodeCompViewer";

        // Put on handlers
        this.container.onMouseMove = () => { this.handleMouseMove() };


        // Add button
        const newButton = new Button(this._ref.app, () => console.log("Hello!"));
        newButton.setParent(this);
        newButton.setPosition([sizeX/2 - sizeX*0.1,-sizeY/2 + sizeY * 0.1]);
    }

    addParamNode(type, params)
    {
        const newNode = new ParamNode(this._ref.app, type, params);
        newNode.initialize();
        newNode.setParent(this);

        // Save ref
        if (type === "IN") this.elements.nodes.IN.push(newNode);
        else if (type === "OUT") this.elements.nodes.OUT.push(newNode);
    }

    addFunctionNode(effectorFnc)
    {
        const newNode = new FunctionNode(this._ref.app, effectorFnc);
        newNode.initialize();
        newNode.setParent(this);

        // Save ref
        this.elements.nodes.function.push(newNode);
    }

    handleMouseMove()
    {

    }
}