import { RenderableObject } from "../../RenderableObject.js";
import { UIObject } from "../UIObject.js";

import { ParamNode } from "./ParamNode.js";
import { FunctionNode } from "./FunctionNode.js";
import { Button } from "../Button.js";

import { ComponentNode } from "./ComponentNode.js";
import { UITextInput } from "../UITextInput.js";

import { createNewText } from "../../Text/textHelper.js";

import { isNumeric } from "../../utils.js";

export class Component extends UIObject
{
    elements = {
        nodes: {
            IN: [],
            FNC: [],
            OUT: [],
        },
        buttons:
        {
            hide: undefined,
        },
        lines: [],
        outside: undefined
    }

    animation = {
        duration: 0.
    }

    activeObj = undefined;

    style = {
        ...this.style,
        text: {
            paramTextOffsetX: undefined
        },
    }

    isExtended = true;

    constructor(appRef, buffInfo, size, colour, name = "New component")
    {
        super(appRef, buffInfo);

        this.initialize(size);
        this.setName(name);
    }

    initialize(size = [700, 350], colour = [0.5,0.1,0.3,1])
    {
        
        [this.style.container.width, this.style.container.height] = size;

        // Stylize Node
        this.style.text.paramTextOffsetX = this.style.container.width/2;
        this.style.marginX = this.style.container.width/10;
        this.style.marginY = this.style.container.height/10;

        // const rect = new RenderableObject(this._ref.app.primitiveBuffers.rectangle);
        this.setScale([this.style.container.width/100,this.style.container.height/100]);
        this.setOriginalColor(colour);

        // Save ref and connect to UIViewer
        this.setParent(this._ref.UI.viewer);

        this.name = "NodeCompViewer";

        // Add button
        const newButton = new Button(this._ref.app,this._ref.app.primitiveBuffers.rectangle, () => console.log("Hello!"));
        newButton.setParent(this);
        newButton.setPosition([this.style.container.width*0.9, this.style.container.height*0.1]);

        // Create text
        const durationTextPos = [this.style.container.width / 2, 0];
        const txtArr = [
            {
            data: "Duration: ",
            pos: durationTextPos   
            },
        ]

        const txtBatch = this.createBatchText(txtArr, 10);
        txtBatch.setParent(this);

        // Add input for duration
        const durationInput = new UITextInput(this._ref.app, this._ref.app.primitiveBuffers.rectangle, 10, this, "input");
        durationInput.setPosition([this.style.container.width / 2, this.style.container.height * 0.1]);
        durationInput.handlers.onValueChange = (newVal) => this.changeDuration(newVal);

        // Handlers
        newButton.setOnClick(this.transformToNode.bind(this));
        this.handlers.onDblClick = this.transformToInsideComponent.bind(this);

        // Save ref
        this.elements.buttons.hide = newButton;
    }

    initializeNode()
    {
        const outsideNode = new ComponentNode(this._ref.app,this._ref.app.UI.UIBuffers.UINode.container.buffer.getInfo(), this);
        outsideNode.initialize();

        this.elements.outside = outsideNode;
    }

    addParamNode(type, params)
    {
        const newNode = new ParamNode(this._ref.app, this._ref.app.UI.UIBuffers.ObjNode.container.buffer.getInfo(), type, params);
        newNode.initialize();
        newNode.setParent(this);

        // Save ref
        if (type === "IN") this.elements.nodes.IN.push(newNode);
        else if (type === "OUT") this.elements.nodes.OUT.push(newNode);
    }

    addFunctionNode(effectorFnc)
    {
        const containerBuffer = this._ref.app.UI.UIBuffers.UINode.container.buffer.getInfo();
        const newNode = new FunctionNode(this._ref.app, containerBuffer, effectorFnc);
        newNode.initialize();
        newNode.setParent(this);

        // Save ref
        this.elements.nodes.FNC.push(newNode);
    }

    transformToNode()
    {
        this.changeNodesVisibility(false);
        this.changeSize(false);
        this.elements.buttons.hide.setVisible(false);

        if (!this.elements.outside) this.initializeNode();
        else this.elements.outside.transformToNode(true);

        // need to update world matrix property as a new position of components
        // won't be available til redraw
        this.elements.outside.container.updateWorldMatrix(this.elements.outside.container.parent.worldMatrix);
        this.elements.outside.handleMouseMove();

        this.isExtended = false;
    }

    transformToInsideComponent()
    {
        if (this.isExtended) return;

        this.changeNodesVisibility(true);
        this.changeSize(true);
        this.elements.buttons.hide.setVisible(true);

        this.elements.outside.transformToNode(false);

        // need to update world matrix property as a new position of components
        // won't be available til redraw
        console.log(this.elements.outside);
        this.elements.outside.container.updateWorldMatrix(this.elements.outside.container.parent.worldMatrix);
        this.elements.outside.handleMouseMove();

        this.isExtended = true;
    }

    changeSize(extend)
    {
        const newNodeSize = [130, 130];

        let newSize;
        if (extend)
        {
            const currPos = this.properties.position;
            newSize = [ this.style.container.width/100, this.style.container.height/100 ];
            this.setPosition( [currPos[0] - this.style.container.width/2 + newNodeSize[0]/2, currPos[1] - this.style.container.height/2 + newNodeSize[1]/2] );
        }
        else {
            newSize = [1.3, 1.3];
            const currPos = this.properties.position;
            this.setPosition( [currPos[0] + this.style.container.width/2 - newNodeSize[0]/2, currPos[1] + this.style.container.height/2 - newNodeSize[1]/2] );
        }

        this.setScale(newSize);
    }

    changeNodesVisibility(isVisible)
    {
        // hide lines
        this.children.forEach( (child) => {
            child.setVisible(isVisible); }
        );

        // hide nodes
        for (const nodeType in this.elements.nodes)
            {
                this.elements.nodes[nodeType].forEach( (nodeArr) => {
                    nodeArr.setVisibleNode(isVisible);
                });
            }
    }

    setActiveObj(obj)
    {
        if (!(obj instanceof RenderableObject)) throw new Error("Wrong Active Object type!");
        this.activeObj = obj;
    }

    createBatchText(txtArr, txtSize, txtColour = [1,1,1,1])
    {
        // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], txtArr, txtSize, this._ref.UI.font, txtColour);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ 0, 0 ]);

        return txtBatch;
    }

    changeDuration(newDuration)
    {
        if (isNumeric(newDuration)) this.animation.duration = parseFloat(newDuration);
        console.log(this.name + " new duration: " + this.duration);
    }
}