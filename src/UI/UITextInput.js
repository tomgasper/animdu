import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UIObject } from "./UIObject.js";
import { createNewRect } from "../sceneHelper.js";

import { RenderableObject } from "../Primitives/RenderableObject.js";

export class UITextInput extends UIObject
{
    height = 100;
    width = 200;
    containerBuffer = undefined;

    active = false;
    value = "Put text here!";

    scene = {};
    parent = {};

    txtObj = {};

    container = {};

    constructor(scene, rect, txtSize, parent, value = "Input text")
    {
        super();

        this.scene = scene;

        // Putting inside buffer from past in rect
        if (rect)
        {
            this.height = rect.height;
            this.width = rect.width;
            this.containerBuffer = rect.buffer ? rect.buffer : undefined;
        }

        this.active = false;
        this.parent = parent;

        this.txtSize = txtSize;
        this.value = value;

        this.initialize();
    }

    initialize()
    {
        //
        if (this.containerBuffer)
        {
            this.container = new RenderableObject(this.containerBuffer.getInfo(), getProjectionMat(this.scene.gl));
        }
        else {
            this.container = createNewRect(this.scene, this.width, this.height, 0.15);
        }

        this.container.setOriginalColor([1,1,1,1]);
        this.container.setCanBeMoved(false);

        const txtColor = [0.1,0.1,0.1,1];

        // add children
        const txt = createNewText(this.scene.gl, this.scene.programs[2], this.value, this.txtSize, this.scene.fontUI,txtColor);
        txt.setCanBeMoved(false);
        txt.setBlending(true);
        txt.setCanBeHighlighted(true);

        this.txtObj = txt;

        // txt width
        const txtWidth = txt.txtBuffer.str.cpos[0];

        // centre the text
        txt.setPosition([this.width/2-txtWidth/2,0]);

        this.container.handlers.onInputKey = (e) => { this.handleInput(e,txt); };
        txt.handlers.onInputKey = (e) => { this.handleInput(e,txt); };

        // set hierarchy
        if (this.parent) this.container.setParent(this.parent);
        txt.setParent(this.container);

        this.parent.updateWorldMatrix();

        this.addObjsToRender([this.container,txt]);
    }

    handleInput(e,txt)
    {
        // Get rid of placeholder txt on click
        const currStr = txt.getText();

        if( currStr === this.value) {
            txt.updateText(e.key);
        }
        else {
            txt.updateText(currStr + e.key);
        }

        // center the text
        this.centerText(txt);
    }

    centerText()
    {
        const txtWidth2 = this.txtObj.txtBuffer.str.cpos[0];
        this.txtObj.setPosition([this.width/2-txtWidth2/2,0]);
        this.txtObj.updateWorldMatrix(this.txtObj.parent.worldMatrix);
    }

    changeValue(txt)
    {
        if (this.txtObj)
        {
            this.txtObj.updateText(txt);
            this.centerText();
        }
    }

    setPosition([x,y])
    {
        this.container.setPosition([x,y]);
    }
}