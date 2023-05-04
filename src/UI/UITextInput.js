import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UIObject } from "./UIObject.js";
import { createNewRect } from "../sceneHelper.js";

export class UITextInput extends UIObject
{
    height = 100;
    width = 200;

    active = false;
    placeholderStr = "Put text here!";

    scene = {};
    parent = {};

    bg = {};

    constructor(scene, width, height, txtSize, parent, placeholderStr = "Input text" )
    {
        super();

        this.scene = scene;

        this.active = false;
        this.height = height;
        this.width = width;

        this.parent = parent;

        this.txtSize = txtSize;
        this.placeholderStr = placeholderStr;

        this.initialize();
    }

    initialize()
    {
        //
        this.bg = createNewRect(this.scene, this.width, this.height, 0.15);
        this.bg.setOriginalColor([1,1,1,1]);
        this.bg.setCanBeMoved(false);
        // this.bg.properties.blending = true;

        const txtColor = [0.1,0.1,0.1,1];

        // add children
        const txt = createNewText(this.scene.gl, this.scene.programs[2], this.placeholderStr, this.txtSize, this.scene.fontUI,txtColor );
        // txt.setColor([0.2,0.3,0.4,1]);
        txt.setCanBeMoved(false);
        txt.setBlending(true);
        txt.setCanBeHighlighted(true);

        // txt width
        const txtWidth = txt.txtBuffer.str.cpos[0];

        // centre the text
        txt.setPosition([this.width/2-txtWidth/2,0]);

        this.bg.handlers.onInputKey = (e) => { this.handleInput(e,txt); };
        txt.handlers.onInputKey = (e) => { this.handleInput(e,txt); };

        // set hierarchy
        if (this.parent) this.bg.setParent(this.parent);
        txt.setParent(this.bg);

        this.parent.updateWorldMatrix();

        this.addObjsToRender([this.bg,txt]);
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
        this.bg.setPosition([x,y]);
    }
}