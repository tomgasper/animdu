import { RenderableObject } from "../../RenderableObject.js";
import { UIObject } from "../UIObject.js";
import { ParamNode } from "./ParamNode.js";
import { FunctionNode } from "./FunctionNode.js";
import { Button } from "../Button.js";
import { ComponentNode } from "./ComponentNode.js";
import { UITextInput } from "../UITextInput.js";
import { createNewText } from "../../Text/textHelper.js";
import { isNumeric } from "../../utils.js";
import { hexToRgb } from "../../utils.js";
import { UINode } from "./UINode.js";
import { UINodeParam } from "./UINodeParam.js";
export class Component extends UIObject {
    constructor(appRef, buffInfo, animationDuration, name = "New component") {
        super(appRef, buffInfo);
        this.elements = {
            nodes: {
                IN: [],
                FNC: [],
                OUT: [],
            },
            buttons: {
                hide: undefined,
            },
            lines: [],
            outside: undefined
        };
        this.animation = {
            duration: 5.,
            timer: 0.
        };
        this.activeObj = undefined;
        this.style = Object.assign(Object.assign({}, this.style), { text: {
                paramTextOffsetX: undefined
            }, margin: {
                x: undefined,
                y: undefined
            }, body: {
                text: {}
            }, heading: {
                text: {
                    upscale: undefined,
                    size: undefined
                }
            } });
        this.isExtended = true;
        this.addExtraParam({ resolution: [this._ref.app.canvas.width, this._ref.app.canvas.height] });
        this.setName(name);
        this.setAnimationDuration(animationDuration);
        this.initialize();
    }
    initialize(size = [700, 350]) {
        // Style
        [this.style.container.width, this.style.container.height] = size;
        this.style.container.colour = hexToRgb(this._ref.UI.style.nodes.component.container.colour, 0.85);
        this.style.margin.x = 10;
        this.style.margin.y = 8;
        this.style.body.text.size = 9;
        this.style.heading.text.size = 12;
        this.style.heading.text.upscale = 2.0;
        // Aliases
        const fontBody = this._ref.UI.style.nodes.general.body.text;
        const fontHeading = this._ref.UI.style.nodes.general.heading.text;
        const upscale = this.style.heading.text.upscale;
        // Set properties of the container
        this.setScale([this.style.container.width / 100, this.style.container.height / 100]);
        this.setOriginalColor(this.style.container.colour);
        this.setBlending(true);
        this.setParent(this._ref.UI.viewer);
        // Add button
        const newButton = new Button(this._ref.app, this._ref.app.primitiveBuffers.rectangle, () => console.log("Hello!"));
        newButton.setParent(this);
        newButton.setPosition([this.style.container.width * 0.9, this.style.margin.y + (newButton.properties.scale[1] * 100) / 2]);
        newButton.setOriginalColor(hexToRgb(this._ref.UI.style.nodes.component.hideButton.colour));
        // Text
        this.txtArr = undefined;
        // Heading text
        const headingTxt = this.name;
        const titleTxt = createNewText(this._ref.app.gl, this._ref.app.programs[2], headingTxt, this.style.heading.text.size * this.style.heading.text.upscale, fontHeading.font, hexToRgb(fontBody.colour));
        titleTxt.setScale([1 / upscale, 1 / upscale]);
        titleTxt.setParent(this);
        titleTxt.setPosition([this.style.margin.x * upscale, this.style.margin.y * upscale]);
        this.elements.heading = titleTxt;
        // Duration input
        const txtWidth = titleTxt.buffer.str.cpos[0] / 2;
        const durInputPos = [txtWidth + this.style.margin.x * upscale + 10, this.style.margin.y * upscale + 3];
        const durationInput = new UITextInput(this._ref.app, this._ref.app.primitiveBuffers.rectangle, 10, this, "5.0s", [40, 20]);
        durationInput.setPosition(durInputPos);
        durationInput.handlers.onValueChange = (newVal) => this.changeDuration(newVal);
        // Bound animation object
        this.addParamNode("IN", [new UINodeParam("position", "READ_TEXT", [0, 0])], "Connected Object");
        this.addParamNode("OUT", [
            new UINodeParam("position", "READ_TEXT", [0, 0]),
            new UINodeParam("rotation", "READ_TEXT", 0)
        ], "SET");
        // Set up handlers
        this.handlers.onDblClick = this.transformToInsideComponent.bind(this);
        newButton.setOnClick(this.transformToNode.bind(this));
        // Save ref
        this.elements.buttons.hide = newButton;
    }
    initializeNode() {
        const buffer = this._ref.app.UI.UIBuffers.UINode.container.buffer;
        const outsideNode = new ComponentNode(this._ref.app, buffer, this);
        this.elements.outside = outsideNode;
    }
    setAnimationDuration(animDur) {
        if (isNumeric(animDur))
            this.animation.duration = animDur;
        else
            this.animation.duration = 5.0;
    }
    addParamNode(type, params, customStr = undefined) {
        const paramNodeIndx = this.elements.nodes.IN.length;
        const buffer = this._ref.app.UI.UIBuffers.UINode.container.buffer;
        const newNode = new ParamNode(this._ref.app, buffer, type, params);
        newNode.setParent(this);
        // Save ref
        if (type === "IN") {
            this.elements.nodes.IN.push(newNode);
            // When adding new param node set indx for it to point to the correct handle of component
            newNode.setIndx(this.elements.nodes.IN.length - 1);
            newNode.setPosition([0 + 10, this.style.container.height / 2 - 130 / 2]);
        }
        else if (type === "OUT") {
            this.elements.nodes.OUT.push(newNode);
            newNode.setIndx(this.elements.nodes.OUT.length - 1);
            newNode.setPosition([this.style.container.width - 130 - 10, this.style.container.height / 2 - 130 / 2]);
        }
        newNode.setHeadingText(customStr);
    }
    addFunctionNode(effectorFnc) {
        const containerBuffer = this._ref.app.UI.UIBuffers.UINode.container.buffer;
        const newNode = new FunctionNode(this._ref.app, containerBuffer, this, effectorFnc);
        newNode.setParent(this);
        const size = newNode.getSize();
        newNode.setPosition([(this.style.container.width - size[0]) / 2, (this.style.container.height - size[1]) / 2]);
        // Save ref
        this.elements.nodes.FNC.push(newNode);
    }
    transformToNode() {
        // Turn off inside elements
        this.changeElementsVisibility(false);
        // but keep heading text always visible
        this.elements.heading.setVisible(true);
        this.changeSize(false);
        this.elements.buttons.hide.setVisible(false);
        if (!this.elements.outside)
            this.initializeNode();
        this.elements.outside.transformToNode(true);
        // need to update world matrix property as a new position of components
        // won't be available til redraw
        this.elements.outside.container.updateWorldMatrix(this.elements.outside.container.parent.worldMatrix);
        this.elements.outside.handleMouseMove();
        this.isExtended = false;
    }
    transformToInsideComponent() {
        if (this.isExtended)
            return;
        this.changeElementsVisibility(true);
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
    changeSize(extend) {
        const newNodeSize = [130, 130];
        let newSize;
        if (extend) {
            const currPos = this.properties.position;
            newSize = [this.style.container.width / 100, this.style.container.height / 100];
            this.setPosition([currPos[0] - this.style.container.width / 2 + newNodeSize[0] / 2, currPos[1] - this.style.container.height / 2 + newNodeSize[1] / 2]);
        }
        else {
            newSize = [1.3, 1.3];
            const currPos = this.properties.position;
            this.setPosition([currPos[0] + this.style.container.width / 2 - newNodeSize[0] / 2, currPos[1] + this.style.container.height / 2 - newNodeSize[1] / 2]);
        }
        this.setScale(newSize);
    }
    changeElementsVisibility(isVisible) {
        // hide children
        for (let i = 0; i < this.children.length; i++) {
            const obj = this.children[i];
            if (obj instanceof UINode) {
                obj.setVisibleNode(isVisible);
            }
            else
                obj.setVisible(isVisible);
        }
        /*
        // hide nodes
        for (const nodeType in this.elements.nodes)
        {
            this.elements.nodes[nodeType].forEach( (nodeArr) => {
                nodeArr.setVisibleNode(isVisible);
            });
        }
        */
    }
    setActiveObj(obj) {
        if (!(obj instanceof RenderableObject))
            throw new Error("Wrong Active Object type!");
        this.activeObj = obj;
    }
    clearActiveObj() {
        this.activeObj = undefined;
    }
    createBatchText(txtArr, font) {
        // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], txtArr, font.size, font.font, hexToRgb(font.colour));
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([0, 0]);
        return txtBatch;
    }
    changeDuration(newDuration) {
        if (isNumeric(newDuration))
            this.animation.duration = parseFloat(newDuration);
        console.log(this.name + " new duration: " + this.duration);
    }
}
//# sourceMappingURL=Component.js.map