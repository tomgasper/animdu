import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UIObject } from "./UIObject.js";

import { createNewRect } from "../App/AppHelper.js";

import { RenderableObject } from "../RenderableObject.js";

import { isNumeric } from "../utils.js";

import { changeValueNumeric } from "../utils.js";

export class UITextInput extends UIObject
{
    height = 50;
    width = 100;
    containerBuffer = undefined;

    active = false;
    value = "Put text here!";

    scene = {};
    parent = {};

    txtObj = {};

    container = {};

    constructor(scene, rect, txtSize, parent, value = "Input text")
    {
        super(scene, rect);

        this.scene = scene;

        // style
        this.height = txtSize * 2;

        this.active = false;
        this.parent = parent;

        this.txtSize = txtSize;
        this.placeholder = value;

        this.initialize();
    }

    initialize()
    {
        this.setScale([this.width/100,this.height/100]);
        this.setOriginalColor([1,1,1,1]);
        this.setCanBeMoved(false);

        const txtColor = [0.1,0.1,0.1,1];

        // add children
        const txt = createNewText(this.scene.gl, this.scene.programs[2], this.placeholder, this.txtSize, this.scene.UI.font ,txtColor);
        txt.setCanBeMoved(false);
        txt.setBlending(true);
        txt.setCanBeHighlighted(true);

        this.txtObj = txt;

        // txt width
        const txtWidth = txt.txtBuffer.str.cpos[0];

        // centre the text
        txt.setPosition([this.width/2-txtWidth/2, 0 ]);

        this.handlers.onInputKey = (e) => { this.handleInput(e); };
        txt.handlers.onInputKey = (e) => { this.handleInput(e); };

        // set hierarchy
        if (this.parent) this.setParent(this.parent);
        txt.setParent(this);
    }

    handleInput(e)
    {
        // Get rid of placeholder txt on click
        const currStr = this.txtObj.getText();

        const newStr = changeValueNumeric(this.placeholder, currStr, e.key);

        console.log(newStr);
        if ((typeof newStr !== "string")) return;

        this.txtObj.updateText(newStr);

        // center the text
        this.centerText();
    }

    centerText()
    {
        const txtWidth2 = this.txtObj.txtBuffer.str.cpos[0];
        this.txtObj.setPosition([this.width/2-txtWidth2/2,0]);
        // this.txtObj.updateWorldMatrix(this.txtObj.parent.worldMatrix);
    }

    changeValue(txt)
    {
        if (this.txtObj)
        {
            this.txtObj.updateText(txt);
            this.centerText();
        }
    }

    setVisible(isVisible)
    {
        this.properties.visible = isVisible;
        for (let child of this.children)
        {
            child.setVisible(isVisible);
        }
    }
}