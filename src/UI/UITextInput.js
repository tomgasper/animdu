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
    placeholderStr = "Put text here!";

    scene = {};
    parent = {};

    bg = {};

    constructor(scene, rect, txtSize, parent, placeholderStr = "Input text")
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
        this.placeholderStr = placeholderStr;

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
        const txt = createNewText(this.scene.gl, this.scene.programs[2], this.placeholderStr, this.txtSize, this.scene.fontUI,txtColor);
        txt.setCanBeMoved(false);
        txt.setBlending(true);
        txt.setCanBeHighlighted(true);

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
        if( txt.properties.txt_string === this.placeholderStr) {
            txt.properties.txt_string = e.key;
        }
        else {
            txt.properties.txt_string += e.key;
        }

        txt.txtBuffer.updateTextBufferData(txt.properties.txt_string, this.txtSize);

        const txtWidth2 = txt.txtBuffer.str.cpos[0];
        txt.setPosition([this.width/2-txtWidth2/2,0]);
        txt.updateWorldMatrix(txt.parent.worldMatrix);
    }

    setPosition([x,y])
    {
        this.container.setPosition([x,y]);
    }
}