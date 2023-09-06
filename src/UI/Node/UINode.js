import { getProjectionMat } from "../../utils.js";
import { createNewText } from "../../Text/textHelper.js";

import { UIObject } from "../UIObject.js";

import { RenderableObject } from "../../RenderableObject.js";

import { UINodeHandle } from "./UINodeHandle.js";
import { getPosFromMat } from "../../App/AppHelper.js";

import { UINodeParam } from "./UINodeParam.js";

import { isNumeric } from "../../utils.js";

import { transformToParentSpace } from "../../utils.js";


export class UINode extends UIObject
{
    type = undefined;
    parameters = undefined;

    _ref = {
        ...this._ref,
        component: undefined
    };

    style = {
        container:
        {
            width: undefined,
            height: undefined,
            colour: [0.05,0.5,0.95,1]
        },
        marginX: undefined,
        marginY: undefined,
        text: {
            size: 9,
            colour: [1,1,1,1],
            paramTextOffsetY: 20,
            paramTextOffsetX: undefined,
        },

        handles:
        {
            L:
            {
                position: undefined
            },
            R:
            {
                position: undefined
            }
        }
    }

    elements =
    {
        handles:
        {
            L: [],
            R: []
        }
    }

    // array of objs
    // { 
    //  paramName: "string",
    //  value: "0"
    // }

    constructor(appRef, paramsList, buffInfo)
    {
        super(appRef, buffInfo);

        this.parameters = paramsList;
    }

    initialize()
    {
        // Set size based on the background container size
        const UIBuffers = this._ref.UI.UIBuffers.UINode;

        [this.style.container.width, this.style.container.height ] = UIBuffers.container.size;

        // Stylize Node
        this.style.text.paramTextOffsetX = this.style.container.width/2;
        this.style.marginX = this.width/10;
        this.style.marginY = this.height/10;

        // Retrieve previously initialized buffer
        const UINodeContainerBuffer = UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer);
        rect.setPosition([0,0]);
        rect.setOriginalColor(this.containerColor);
        rect.handlers.onMouseMove = () => { this.handleMouseMove() };

        // Save ref
        this.container = rect;

        // Init graphical handlers
        const cirlceBuffer = UIBuffers.handle.buffer.getInfo();

        const handleR = new UINodeHandle(this._ref.app, cirlceBuffer, this, this.container);
        handleR.setPosition([this.style.container.width, this.style.container.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        this.elements.handles.R = [ handleR ];

        const handleL = new UINodeHandle(this._ref.app, cirlceBuffer, this, this.container);
        handleL.setPosition([0, this.style.container.height/2]);
        handleL.setOriginalColor([0.2,0.2,0.2,1])
        handleL.setCanBeMoved(false);
        this.elements.handles.L = [ handleL ];

        /* this is how txtArr obj looks like:
            const txtArr = [
                {
                data: "Param 1",
                pos: [0,0]   
                }, ...
            ]
       */

        this.txtArr;

        // Render text
        if (this.parameters)
        {
            this.txtArr = this.convertToTxtArr(this.parameters.list);
        }

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, this.txtSize, this._ref.UI.font, this.txtColor);
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
                    pos: [0+offX, (indx*this.style.text.paramTextOffsetY) + offY ]
                },
                {
                    data: txt.value.toString(),
                    pos: [this.style.text.paramTextOffsetX + offX, (indx*this.style.text.paramTextOffsetY) + offY]
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

        this.parameters.addNewParam(
            new UINodeParam(paramNameStr)
        );

        const newTxtBg = this.createTxtBg(parent, this.parameters.list.length);
        this.txtBgArr = newTxtBg;

        const newTxtArr = this.convertToTxtArr(this.parameters.list);
        this.txtBuffer.txtBuffer.updateTextBufferData(newTxtArr, 9);
        this.container.updateWorldMatrix();
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
        const paramsNum = this.parameters.list.length;
        const pos = [(this.style.container.width-sliderBgSize[0])/2, paramsNum*this.style.text.paramTextOffsetY+sliderBgSize[1]/2];

        sliderBg.setPosition(pos);
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
        const handles = [...this.elements.handles.L, ...this.elements.handles.R];

        handles.forEach( (handle) => {
            const isConnectedIN = handle.line.connection.type == "IN" ? true : false;

            // return if there's nothing to update
            if (!isConnectedIN && !handle.line.obj) return;

            let data;
            let objToUpdate;
            const connectedObj = handle.line.connection.connectedObj;

            let connectedObjPos = getPosFromMat(connectedObj);
            let handlePos = getPosFromMat(handle);

            // center the line end
            const vecs= [ connectedObjPos, handlePos ];
            transformToParentSpace(this.container.parent, vecs, true);
            [ connectedObjPos, handlePos ] = vecs;

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
        // this.container.updateWorldMatrix();
    }

    setVisible(isVisible)
    {
        this.container.setVisible(isVisible);
        this.container.children.forEach( (child) => child.setVisible(isVisible)) ;
    }
    
    createHandle(pos, parent, parameter)
    {
        const cirlceBuffer = this._ref.UIBuffers.handle.buffer.getInfo();

        const handle = new UINodeHandle(this._ref.app, cirlceBuffer, this, this.container);
        handle.setParent(parent);
        handle.setPosition(pos);
        handle.setOriginalColor([0.2,0.2,0.2,1])
        handle.setCanBeMoved(false);

        if (parameter)
        {
            handle.setParameter(parameter);
        }

        return handle;
    }

    addIOHandles(type, paramsNum, parent, offsetY = 0)
    {
        let offsetX, arrToPush;

        if (type === "IN")
        {
            offsetX = 0;
            arrToPush = this.elements.handles.L;
        } else if (type === "OUT")
        {
            offsetX = this.style.container.width;
            arrToPush = this.elements.handles.R;
        }

        for (let i = 0; i < paramsNum; i++)
        {
        const pos = [offsetX, this.style.marginY + ((i)*this.style.text.paramTextOffsetY + this.style.text.size + offsetY)];
        let param = undefined;

        if (this.parameters)
        {
            param = this.parameters.list[i];
        }
        
        const newHandle = this.createHandle(pos, parent, param);
        arrToPush.push(newHandle);
        }
    }
}