import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { SceneObject } from "../SceneObject.js";

import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UIObject } from "./UIObject.js";

export class UITextInput extends UIObject
{
    height = 100;
    width = 200;

    active = false;
    placeholderStr = "Put text here!";

    scene = {};

    objsToRender = [];

    constructor(scene, height, width)
    {
        this.scene = scene;

        this.active = false;

        this.height = height;
        this.width = width;

        this.initialize();
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.scene.gl);

        const rectangleBuffer = new RectangleBuffer(this.scene.gl,this.scene.programs[0], [this.height,this.width], 0.05);    
        const rect = new SceneObject(rectangleBuffer.getInfo(), projectionMat);
        rect.canBeMoved = false;
        rect.setPosition([120,0]);
        rect.setOriginalColor([0.5,0.5,0.5,1]);

        // add children
        const txt_1 = createNewText(this.scene.gl, this.scene.programs[2], this.placeholderStr, 20, this.scene.fontUI, getProjectionMat(this.scene.gl));
        txt_1.canBeMoved = false; 
        txt_1.properties.blending = true;
        txt_1.properties.highlight = false;
        txt_1.setPosition([0,0]);
        txt_1.setScale([0.6,0.6]);

        

        rect.handlers.onInputKey = (e) => {
            // Get rid of placeholder txt on click
            if( txt_1.properties.txt_string === this.placeholderStr) {
                txt_1.properties.txt_string = e.key;
            }
            else {
                txt_1.properties.txt_string += e.key;
            }

            txt_1.txtBuffer.updateTextBufferData(txt_1.properties.txt_string);
        }

        txt_1.setParent(rect);
        rect.updateWorldMatrix();

        this.objsToRender.push(rect,txt_1);
    }
}