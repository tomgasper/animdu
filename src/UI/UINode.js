import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UIObject } from "./UIObject.js";

import { RenderableObject } from "../RenderableObject.js";

import { UINodeHandle } from "./UINodeHandle.js";
import { getPosFromMat } from "../App/AppHelper.js";

export class UINode extends UIObject
{
    // Standard size
    height = undefined;
    width = undefined;

    containerColor = [0.05,0.5,0.95,1];
    txtSize = 9;
    txtColor = [1,1,1,1];

    scene = {};
    objsToRender = [];

    numOfParams = 0;
    paramTextOffsetY = 20;
    paramTextOffsetX = undefined;

    marginX = undefined;
    marginY = undefined;

    container = {};

    handleL = {};
    handleR = {};

    // array of objs
    // { 
    //  paramName: "string",
    //  value: "0"
    // }

    parameters = [];

    constructor(scene)
    {
        super();

        this.scene = scene;

        this.initialize();
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.scene.gl);

        // Set size based on the background container size
        this.UIBuffers = this.scene.UIBuffers.UINode;
        this.width = this.UIBuffers.container.size[0];
        this.height = this.UIBuffers.container.size[1];

        // Stylize Node
        this.paramTextOffsetX = this.width/2;
        this.marginX = this.width/10;
        this.marginY = this.height/10;

        // Retrieve previously initialized buffer
        const UINodeContainerBuffer = this.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer, projectionMat);
        rect.setPosition([0,0]);
        rect.setOriginalColor(this.containerColor);
        rect.handlers.onMouseMove = () => { this.handleMouseMove() };

        // Save ref
        this.container = rect;

        // Init graphical handlers
        const cirlceBuffer = this.UIBuffers.handle.buffer.getInfo();

        const handleR = new UINodeHandle(this.scene, cirlceBuffer, this, this.container);
        handleR.setPosition([this.width, this.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        this.handleR = handleR;

        const handleL = new UINodeHandle(this.scene, cirlceBuffer, this, this.container);
        handleL.setPosition([0, this.height/2]);
        handleL.setOriginalColor([0.2,0.2,0.2,1])
        handleL.setCanBeMoved(false);
        this.handleL = handleL;

        this.addObjToRender(rect);
        this.addObjsToRender([handleL, handleR]);

        this.parameters = [
            {
                paramName: "First",
                value: "0"
            },
            {
                paramName: "Second",
                value: "0"
            },
            {
                paramName: "Thirdoo",
                value: "0"
            }
        ];

        /* this is how txtArr obj looks like:
            const txtArr = [
                {
                data: "Param 1",
                pos: [0,0]   
                }, ...
            ]
       */
        this.txtArr = this.convertToTxtArr(this.parameters);

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this.scene.gl, this.scene.programs[2], this.txtArr, this.txtSize, this.scene.fontUI, this.txtColor);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.marginX, this.marginY ]);
        txtBatch.setParent(this.container);

        // Create slider
        const sliderContObjs = this.createSlider([1,1], this.container);

        this.txtBuffer = txtBatch;
        this.txtBgArr = this.createTxtBg(txtBatch, this.parameters.length);
        this.addObjsToRender([...this.txtBgArr, ...sliderContObjs, txtBatch]);

        // this.parameter.X.container.handlers.onClick = () => {
        //     if (this.handleR.line.connection.isConnected)
        //     {
        //         console.log(this.handleR.line.connection.connectedObj.node);
        //         this.handleR.line.connection.connectedObj.node.parameter.X.changeValue("HELLO G!");
        //     }
        // }

        this.addParam("New param!", txtBatch);
    }

    convertToTxtArr(params)
    {
        const txtArr = [];

        this.numOfParams = 0;

        params.forEach( (txt, indx) => {
            txtArr.push({
                data: txt.paramName,
                pos: [0, indx*this.paramTextOffsetY ]
            },
            {
                data: txt.value,
                pos: [this.paramTextOffsetX, indx*this.paramTextOffsetY]
            });

            this.numOfParams = this.numOfParams + 1;
        })
        return txtArr;
    }

    addParam(paramNameStr, parent = this.container)
    {
        // Init UI text input
        // const txtWidth = txt.txtBuffer.str.cpos[0];
        // const txtHeight = txt.txtBuffer.str.rect[3];

        // remove objs
        this.removeObjs(this.scene, [this.txtBuffer, ...this.txtBgArr]);
        this.numOfParams = 0;

        this.parameters.push(
            {
                paramName: paramNameStr,
                value: "0"
            }
        );

        const newTxtBg = this.createTxtBg(parent, this.parameters.length);
        this.txtBgArr = newTxtBg;

        const newTxtArr = this.convertToTxtArr(this.parameters);
        this.txtBuffer.txtBuffer.updateTextBufferData(newTxtArr, 9);
        this.container.updateWorldMatrix();

        this.addObjsToRender([...newTxtBg, this.txtBuffer]);
    }

    createTxtBg(parent = this.container, n)
    {
        const buffer = this.UIBuffers.textInput.buffer;

        const arrOfTxtBgs = [];

        for (let i=0; i < n; i++)
        {
            const rect = this.addNewTxtBg(parent, i);
            arrOfTxtBgs.push(rect);
        }

        return arrOfTxtBgs;
    }

    createSlider(size = [1,1], parent = this.container)
    {
        // Set up bg for slider
        const sliderBgBuffer = this.UIBuffers.sliderBg.buffer.getInfo();
        const sliderBg = new RenderableObject(sliderBgBuffer, getProjectionMat(this.scene.gl));
        sliderBg.setCanBeMoved(false);
        sliderBg.setCanBeHighlighted(false);
        sliderBg.setParent(parent);

        // Set up circle
        const circleBuffer = this.UIBuffers.sliderCircle.buffer.getInfo();
        const sliderCircle = new RenderableObject(circleBuffer, getProjectionMat(this.scene.gl));
        sliderCircle.setScale(size);
        sliderCircle.setCanBeMoved(true);
        sliderCircle.setPosition([0,this.UIBuffers.sliderBg.size[1]/2]);
        sliderCircle.setOriginalColor([0,0,0,1]);
        sliderCircle.setParent(sliderBg);
        sliderCircle.moveRestriction = {x: [0,100], y: [this.UIBuffers.sliderBg.size[1]/2,this.UIBuffers.sliderBg.size[1]/2] };

        return [sliderBg, sliderCircle];
    }

    addNewTxtBg(parent, indx)
    {
        const buffer = this.UIBuffers.textInput.buffer;

        const rect = new RenderableObject(buffer.getInfo(), getProjectionMat(this.scene.gl));
        rect.setPosition([this.paramTextOffsetX, indx*this.paramTextOffsetY]);
        rect.setParent(parent);
        rect.setCanBeMoved(false);
        rect.setOriginalColor([0.05,0.05,0.6,1]);

        rect.handlers.onInputKey = (e) => this.handleInput(e, indx);

        return rect;
    }

    handleInput(e,indx)
    {
        if (this.parameters[indx].value === "0")
        {
            this.parameters[indx].value = e.key;
        }
        else {
            this.parameters[indx].value = this.parameters[indx].value + e.key;
        }

        const newTextArr = this.convertToTxtArr(this.parameters);            
        this.txtBuffer.txtBuffer.updateTextBufferData(newTextArr, 9);
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

    setPosition(pos)
    {
        this.container.setPosition(pos);
        this.container.updateWorldMatrix();
    }
}