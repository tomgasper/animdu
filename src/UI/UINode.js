import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { SceneObject } from "../SceneObject.js";

import { Node } from "../Node/Node.js";

import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UITextInput } from "./UITextInput.js";

import { UIObject } from "./UIObject.js";

export class UINode extends UIObject
{
    // Standard size
    height = 120;
    width = 200;

    scene = {};
    objsToRender = [];

    constructor(scene)
    {
        this.scene = scene;

        this.initialize();
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.scene.gl);

        const rectangleBuffer = new RectangleBuffer(this.scene.gl,this.scene.programs[0], [this.width,this.height], 0.05);    
        const rect = new SceneObject(rectangleBuffer.getInfo(), projectionMat);
        rect.setPosition([0,0]);
        rect.setOriginalColor([0.05,0.5,0.95,1]);
        this.addObjToRender(rect);

        this.addTextEntry("Hello mate how are you?!", rect);

        // const textInput = new UITextInput(this.scene, 150,50);

        // txt_2.setParent(rect);

        // textInput.getObjsToRender()[0].setParent(txt_1);

        rect.updateWorldMatrix();

        // console.log(textInput.getObjsToRender());

        // this.objsToRender.push(rect,txt_1,txt_2 );
        // this.objsToRender.push(...textInput.getObjsToRender());

        console.log(this.objsToRender);
    }

    addTextEntry(txtStr, parent)
    {
        const txtSize = 9.0;
        const txt = createNewText(this.scene.gl, this.scene.programs[2], txtStr, txtSize, this.scene.fontUI, getProjectionMat(this.scene.gl));
        txt.canBeMoved = false;

        const o_x = txt.txtBuffer.str.cpos[0]/2;
        txt.setPosition([ this.width/10, this.height/2 - txt.txtBuffer.str.rect[3]/2]);

        if (parent) txt.setParent(parent);
        else txt.updateWorldMatrix();

        this.addObjToRender(txt);

        return txt;
    }

    addTextInput()
    {
        const textInput = new UITextInput(this.scene, 150,50);
    }

    getObjsToRender()
    {
        return this.objsToRender;
    }
}