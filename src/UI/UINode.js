import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { SceneObject } from "../SceneObject.js";

import { Node } from "../Node/Node.js";

import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UITextInput } from "./UITextInput.js";

import { UIObject } from "./UIObject.js";

import { RenderableObject } from "../Primitives/RenderableObject.js";

import { CircleBuffer } from "../Primitives/CircleBuffer.js";

import { LineBuffer } from "../Primitives/LineBuffer.js";

import { createNewRect } from "../sceneHelper.js";

export class UINode extends UIObject
{
    // Standard size
    height = 120;
    width = 200;

    scene = {};
    objsToRender = [];

    lastEntry = 0;

    bg = {};

    handleRBuffer = [];

    UITextInputBuffers = {
        rect: undefined,
    }

    constructor(scene)
    {
        super();

        this.scene = scene;

        this.initialize();
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.scene.gl);

        const containerColor = [0.05,0.5,0.95,1];

        const rectangleBuffer = new RectangleBuffer(this.scene.gl,this.scene.programs[0], [this.width,this.height], 0.05);    
        const rect = new RenderableObject(rectangleBuffer.getInfo(), projectionMat);

        // create buffer for text to reuse
        this.UITextInputBuffers.rect = new RectangleBuffer(this.scene.gl,this.scene.programs[0], [100,20], 0.05);

        rect.setPosition([0,0]);
        rect.setOriginalColor(containerColor);

        this.bg = rect;

        const handleL = this.createHandle(7, true);
        const handleR = this.createHandle(7, false);

        this.addObjsToRender([handleL, handleR]);
        this.addObjToRender(rect);

        this.addTextEntry("X: ", rect);
        this.addTextEntry("Y: ", rect);
        this.addTextEntry("Z: ", rect);


        this.bg.updateWorldMatrix();

        // this.onHandleActivation();
    }

    createHandle(size = 10, left = true)
    {
        const cirlceBuffer = new CircleBuffer(this.scene.gl,this.scene.programs[0], size, 15);
        const handle = new RenderableObject(cirlceBuffer.getInfo(), getProjectionMat(this.scene.gl));

        const x_pos = left ? this.width : 0;

        handle.setPosition([x_pos, this.height/2]);
        handle.setOriginalColor([0.2,0.2,0.2,1]);

        handle.setCanBeMoved(false);

        handle.handlers.onClick = (e) => this.onHandleActivation();


        console.log(this.bg);

        handle.setParent(this.bg);

        return handle;
    }

    onHandleActivation()
    {
        let A = [0,0];
        let B = [100,300];
        const handleLineRBuffer = new LineBuffer(this.scene.gl, this.scene.programs[0], A, B, 1);

        const handleLineR = new RenderableObject(handleLineRBuffer.getInfo(), getProjectionMat(this.scene.gl), handleLineRBuffer);
        handleLineR.setOriginalColor([0.2,0.2,0.2,1]);

        this.addObjToRender(handleLineR);
        
        console.log(handleLineR);
    }

    addTextEntry(txtStr, parent = this.bg)
    {
        // Init txt
        const txtSize = 9.0;
        const txtColor = [1,1,1,1];
        const txt = createNewText(this.scene.gl, this.scene.programs[2], txtStr, txtSize, this.scene.fontUI, txtColor);
        txt.setCanBeMoved(false);
        txt.setPosition([ this.width/10, this.height/10+this.lastEntry]);

        // Init UI text input
        const txtWidth = txt.txtBuffer.str.cpos[0];
        const txtHeight = txt.txtBuffer.str.rect[3];

        const txtRect = {
            width: this.width/3,
            height: txtHeight,
            buffer: this.UITextInputBuffers.rect
        }

        const textInput = new UITextInput(this.scene, txtRect, txtSize, txt);
        textInput.setPosition([txtWidth,0]);

        if (parent) txt.setParent(parent);
        else txt.updateWorldMatrix();

        this.addObjToRender(txt);
        this.addObjsToRender(textInput.getObjsToRender());

        // Update last entry pos
        this.lastEntry = this.lastEntry + txtHeight + this.height*0.05;

        return txt;
    }
}