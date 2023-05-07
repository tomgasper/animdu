import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { SceneObject } from "../SceneObject.js";

import { Node } from "../Node/Node.js";

import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UITextInput } from "./UITextInput.js";

import { UIObject } from "./UIObject.js";

import { RenderableObject } from "../Primitives/RenderableObject.js";

import { CircleBuffer } from "../Primitives/CircleBuffer.js";

import { InstancedLineBuffer } from "../Primitives/InstancedLineBuffer.js";
import { InstancedLineCapBuffer } from "../Primitives/InstancedLineCapsBuffer.js";
import { UINodeHandle } from "./UINodeHandle.js";
import { getPosFromMat } from "../sceneHelper.js";


export class UINode extends UIObject
{
    // Standard size
    height = 120;
    width = 200;

    scene = {};
    objsToRender = [];

    lastEntry = 0;

    container = {};

    handleL = {};
    handleR = {};

    parameter = {};

    handleRLine = {
        obj: undefined,
        endpoint: [],
        data : [],
        width: 5,
        connectionId: -1,
        connection: {}
    };

    commonObjects = {
        textInputRect: 
        {
            width: 0,
            height: 0,
            buffer: undefined,
        }
    };

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
        rect.setPosition([0,0]);
        rect.setOriginalColor(containerColor);

        // set up handler
        rect.handlers.onMouseMove = () => { this.handleMouseMove() };

        this.container = rect;

        // create buffer for text to reuse
        this.commonObjects.textInputRect.width = 100;
        this.commonObjects.textInputRect.height = 20;
        this.commonObjects.textInputRect.buffer = new RectangleBuffer(this.scene.gl,this.scene.programs[0], [100,20], 0.05);

        // create buffer for handles for reusability
        const size = 10;
        const resolution = 16;
        const cirlceBuffer = new CircleBuffer(this.scene.gl,this.scene.programs[0], size, resolution);

        const handleR = new UINodeHandle(this.scene,cirlceBuffer.getInfo(), this, this.container);
        handleR.setPosition([this.width, this.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        // save as ref
        this.handleR = handleR;

        const handleL = new UINodeHandle(this.scene, cirlceBuffer.getInfo(), this, this.container);
        handleL.setPosition([0, this.height/2]);
        handleL.setOriginalColor([0.2,0.2,0.2,1])
        handleL.setCanBeMoved(false);
        this.handleL = handleL;

        this.addObjsToRender([handleL, handleR]);
        this.addObjToRender(rect);

        this.parameter.X = this.addTextEntry("X: ", rect);
        this.parameter.Y = this.addTextEntry("Y: ", rect);
        this.addTextEntry("Z: ", rect);
        this.addTextEntry("U: ", rect);

        this.parameter.X.container.handlers.onClick = () => {
            if (this.handleR.line.connection.isConnected)
            {
                console.log(this.handleR.line.connection.connectedObj.node);
                this.handleR.line.connection.connectedObj.node.parameter.X.changeValue("HELLO G!");
            }
        }


        this.container.updateWorldMatrix();
    }


    handleMouseMove()
    {
        const handles = [this.handleR, this.handleL];

        handles.forEach( (handle) => {
            const isConnectedIN = handle.line.connection.type == "IN" ? true : false;

            // return if there's nothing to update
            if (!isConnectedIN && !handle.line.obj) return;

            let data;
            let objToUpdate;
            const connectedObj = handle.line.connection.connectedObj;
            const connectedObjPos = getPosFromMat(connectedObj);
            const handlePos = getPosFromMat(handle);

            if (isConnectedIN === true)
            {
                data = [connectedObjPos[0], connectedObjPos[1], handlePos[0], handlePos[1]];
                objToUpdate = connectedObj.line;
            } else 
            {
                data = [handlePos[0], handlePos[1], connectedObjPos[0], connectedObjPos[1]];
                objToUpdate = handle.line;
            }

            objToUpdate.update.call(objToUpdate, data);
        })
    }

    addTextEntry(txtStr, parent = this.container)
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
            width: this.commonObjects.textInputRect.width,
            height: txtHeight,
            buffer: this.commonObjects.textInputRect.buffer
        }

        const textInput = new UITextInput(this.scene, txtRect, txtSize, txt);
        textInput.setPosition([txtWidth,0]);

        if (parent) txt.setParent(parent);
        else txt.updateWorldMatrix();

        this.addObjToRender(txt);
        this.addObjsToRender(textInput.getObjsToRender());

        // Update last entry pos
        this.lastEntry = this.lastEntry + txtHeight + this.height*0.05;

        return textInput;
    }

    setPosition(pos)
    {
        this.container.setPosition(pos);
        this.container.updateWorldMatrix();
    }
}