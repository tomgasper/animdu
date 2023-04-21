import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { SceneObject } from "../SceneObject.js";

import { Node } from "../Node/Node.js";

import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

export class UINode
{
    height = 160;
    width = 120;

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

        const rectangleBuffer = new RectangleBuffer(this.scene.gl,this.scene.programs[0], [this.height,this.width], 1);    
        const rect = new SceneObject(rectangleBuffer.getInfo(), projectionMat);
        rect.setPosition([0,0]);
        rect.setOriginalColor([0.05,0.5,0.95,1]);

        // add children
        const txt_1 = createNewText(this.scene.gl, this.scene.programs[2], "Param 1:", this.scene.fontUI, getProjectionMat(this.scene.gl));
        txt_1.canBeMoved = false;
        txt_1.blending = true;
        txt_1.setPosition([this.width/10,this.height/10]);
        txt_1.setScale([0.6,0.6]);

        txt_1.setParent(rect);

        const txt_2 = createNewText(this.scene.gl, this.scene.programs[2], "Param 2:", this.scene.fontUI, getProjectionMat(this.scene.gl));
        txt_2.canBeMoved = false;
        txt_2.blending = true;
        txt_2.setPosition([this.width/10,2*this.height/10]);
        txt_2.setScale([0.6,0.6]);

        txt_2.setParent(rect);

        rect.updateWorldMatrix();

        this.objsToRender.push(rect,txt_1,txt_2);
    }

    getObjsToRender()
    {
        return this.objsToRender;
    }
}