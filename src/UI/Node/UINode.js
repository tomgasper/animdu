import { getProjectionMat } from "../../utils.js";
import { createNewText } from "../../Text/textHelper.js";

import { UIObject } from "../UIObject.js";

import { RenderableObject } from "../../RenderableObject.js";

import { UINodeHandle } from "./UINodeHandle.js";
import { getPosFromMat } from "../../App/AppHelper.js";

import { UINodeParam } from "./UINodeParam.js";

import { isNumeric } from "../../utils.js";
import { modifyParameter } from "../../App/AppHelper.js";


export class UINode extends UIObject
{
    // App ref
    app = {};
    objsToRender = [];

    // Standard size
    height = undefined;
    width = undefined;

    containerColor = [0.05,0.5,0.95,1];
    txtSize = 9;
    txtColor = [1,1,1,1];

    type = undefined;
    
    parameters = undefined;
    numOfParams = 0;
    paramTextOffsetY = 20;
    paramTextOffsetX = undefined;

    marginX = undefined;
    marginY = undefined;

    container = {};

    handleL = [];
    handleR = [];

    // array of objs
    // { 
    //  paramName: "string",
    //  value: "0"
    // }

    parameters = [];

    constructor(app, paramsList)
    {
        super(app.UI);

        this.app = app;

        this.parameters = paramsList;

        // this.initialize();
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.app.gl);

        // Set size based on the background container size
        this.UIBuffers = this.UI.UIBuffers.UINode;
        this.width = this.UIBuffers.container.size[0];
        this.height = this.UIBuffers.container.size[1];

        this.numOfParams = this.parameters.list.length;

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

        const handleR = new UINodeHandle(this.app, cirlceBuffer, this, this.container);
        handleR.setPosition([this.width, this.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        this.handleR = [ handleR ];

        const handleL = new UINodeHandle(this.app, cirlceBuffer, this, this.container);
        handleL.setPosition([0, this.height/2]);
        handleL.setOriginalColor([0.2,0.2,0.2,1])
        handleL.setCanBeMoved(false);
        this.handleL = [ handleL ];

        this.addObjToRender(rect);
        this.addObjsToRender([...this.handleL, ...this.handleR]);
        

        /* this is how txtArr obj looks like:
            const txtArr = [
                {
                data: "Param 1",
                pos: [0,0]   
                }, ...
            ]
       */

        // Render text
        this.txtArr = this.convertToTxtArr(this.parameters.list);

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this.app.gl, this.app.programs[2], this.txtArr, this.txtSize, this.UI.font, this.txtColor);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.marginX, this.marginY ]);
        txtBatch.setParent(this.container);

        // Create slider
        // const sliderContObjs = this.createSlider([1,1], this.container);

        // Create text boxes
        this.txtBuffer = txtBatch;
        this.txtBgArr = this.createTxtBg(txtBatch, this.parameters.list.length);
        this.addObjsToRender([...this.txtBgArr, txtBatch]);
    }

    convertToTxtArr(params, offX = 0, offY = 0)
    {
        const txtArr = [];

        params.forEach( (txt, indx) => {
                txtArr.push({
                    data: txt.name.toString(),
                    pos: [0+offX, (indx*this.paramTextOffsetY) + offY ]
                },
                {
                    data: txt.value.toString(),
                    pos: [this.paramTextOffsetX + offX, (indx*this.paramTextOffsetY) + offY]
                });
    
        })
        return txtArr;
    }

    addParam(paramNameStr, parent = this.container)
    {
        // Init UI text input
        // const txtWidth = txt.txtBuffer.str.cpos[0];
        // const txtHeight = txt.txtBuffer.str.rect[3];

        // remove objs
        this.removeObjs(this.app, [this.txtBuffer, ...this.txtBgArr]);
        this.numOfParams = this.parameters.list.length;

        this.parameters.addNewParam(
            new UINodeParam(paramNameStr)
        );

        const newTxtBg = this.createTxtBg(parent, this.parameters.list.length);
        this.txtBgArr = newTxtBg;

        const newTxtArr = this.convertToTxtArr(this.parameters.list);
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
        const sliderBgSize = this.UIBuffers.sliderBg.size;

        const sliderBg = new RenderableObject(sliderBgBuffer, getProjectionMat(this.app.gl));
        sliderBg.setPosition([(this.width-sliderBgSize[0])/2, this.numOfParams*this.paramTextOffsetY+sliderBgSize[1]/2]);
        sliderBg.setCanBeMoved(false);
        sliderBg.setCanBeHighlighted(false);
        sliderBg.setParent(parent);

        // Set up circle
        const circleBuffer = this.UIBuffers.sliderCircle.buffer.getInfo();
        const sliderCircle = new RenderableObject(circleBuffer, getProjectionMat(this.app.gl));
        sliderCircle.setScale(size);
        sliderCircle.setCanBeMoved(true);
        sliderCircle.setPosition([0,sliderBgSize[1]/2]);
        sliderCircle.setOriginalColor([0,0,0,1]);
        sliderCircle.setParent(sliderBg);
        sliderCircle.moveRestriction = {x: [0,100], y: [sliderBgSize[1]/2,sliderBgSize[1]/2] };

        return [sliderBg, sliderCircle];
    }

    addNewTxtBg(parent, indx)
    {
        const buffer = this.UIBuffers.textInput.buffer;

        const rect = new RenderableObject(buffer.getInfo(), getProjectionMat(this.app.gl));
        rect.setPosition([this.paramTextOffsetX, indx*this.paramTextOffsetY]);
        rect.setParent(parent);
        rect.setCanBeMoved(false);
        rect.setOriginalColor([0.05,0.05,0.6,1]);

        rect.handlers.onInputKey = (e) => this.handleInput(e, indx);

        return rect;
    }

    handleInput(e,indx)
    {
        if (this.parameters.list[indx].value == "0" && e.key !== "Backspace")
        {
            this.parameters.list[indx].value = e.key;
        }
        else if (e.key == "Backspace")
        {
                this.parameters.list[indx].value = this.parameters.list[indx].value.slice(0,-1);
        }
        else {
            if (isNumeric(e.key) || e.key === ".")
            {
                this.parameters.list[indx].value = this.parameters.list[indx].value + e.key;
            }
        }

        const newTextArr = this.convertToTxtArr(this.parameters.list);            
        this.txtBuffer.txtBuffer.updateTextBufferData(newTextArr, 9);
    }

    handleMouseMove()
    {
        const handles = [...this.handleR, ...this.handleL];

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

    createHandle(pos, parameter)
    {
        const cirlceBuffer = this.UIBuffers.handle.buffer.getInfo();

        const handle = new UINodeHandle(this.app, cirlceBuffer, this, this.container);
        handle.setPosition(pos);
        handle.setOriginalColor([0.2,0.2,0.2,1])
        handle.setCanBeMoved(false);

        if (parameter)
        {
            handle.setParameter(parameter);
        }

        return handle;
    }

    addIOHandles(type, paramsNum, offsetY = 0)
    {
        let offsetX, arrToPush;

        if (type === "IN")
        {
            offsetX = 0;
            arrToPush = this.handleR;
        } else if (type === "OUT")
        {
            offsetX = this.width;
            arrToPush = this.handleL;
        }

        for (let i = 0; i < paramsNum; i++)
        {
        const pos = [offsetX, this.marginY + ((i)*this.paramTextOffsetY + this.txtSize + offsetY)];
        let param = undefined;

        if (this.parameters)
        {
            param = this.parameters.list[i];
        }
        
        const newHandle = this.createHandle(pos, param);
        arrToPush.push(newHandle);
        }

        /*

        if (type === "IN")
        {
            for (let i = 0; i < paramsNum; i++)
            {
            const pos = [this.width, this.marginY + ((i+1)*this.paramTextOffsetY + this.txtSize + offsetY)];


            const param = this.parameters.list[i];

            const newHandle = this.createHandle(pos, param);

            this.handleR.push(newHandle);
            }
        } else if (type === "OUT")
        {
            for (let i = 0; i < paramsNum; i++)
            {
                const pos = [0, this.marginY + ((i+1)*this.paramTextOffsetY + this.txtSize + offsetY)];
                const param = this.parameters.list[i];

                const newHandle = this.createHandle(pos, param);

                this.handleL.push(newHandle);
            }
        }*/
    }
}