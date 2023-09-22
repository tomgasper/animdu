import { getProjectionMat } from "../../utils.js";
import { UINode } from "./UINode.js";

import { RenderableObject } from "../../RenderableObject.js";
import { UINodeHandle } from "./UINodeHandle.js";

import { createNewText } from "../../Text/textHelper.js";
import { UINodeParamList } from "./UINodeParamList.js";
import { UINodeParam } from "./UINodeParam.js";

import { TransformNode } from "../../Node/TransformNode.js";

export class ObjNode extends UINode
{
    type = "ObjNode";
    obj = undefined;

    constructor(appRef, buffInfo, obj, paramsList)
    {
        super(appRef, buffInfo, paramsList);

        this.obj = obj;
    }

    initialize()
    {
        // Set size based on the background container size
        this.UIBuffers = this._ref.UI.UIBuffers.ObjNode;
        this.width = this.UIBuffers.container.size[0];
        this.height = this.UIBuffers.container.size[1];

        // Stylize Node
        this.paramTextOffsetX = this.width/2;
        this.marginX = this.width/10;
        this.marginY = this.height/10;

        const anchor = new TransformNode();

        // Retrieve previously initialized buffer
        // const UINodeContainerBuffer = this.UIBuffers.container.buffer.getInfo();
        // const rect = new RenderableObject(UINodeContainerBuffer, projectionMat);
        this.setPosition([0,0]);
        this.setOriginalColor(this.containerColor);
        this.handlers.onMouseMove = () => { this.handleMouseMove() };

        // Save ref
        // this.container = rect;

        // Init graphical handlers
        const cirlceBuffer = this.UIBuffers.handle.buffer.getInfo();

        // Render handle for each param to modify

        /*
        const paramsNum = this.parameters.list.length;

        for (let i = 0; i < paramsNum; i++)
        {
            const handleR = new UINodeHandle(this._ref.app, cirlceBuffer, this, this.container);
            handleR.setPosition([this.width, this.marginY + ((i+2)*this.paramTextOffsetY + this.txtSize)]);
            handleR.setOriginalColor([0.2,0.2,0.2,1])
            handleR.setCanBeMoved(false);
            handleR.setParameter(this.parameters.list[i]);

            this.handleR.push(handleR);
        }
        */

        const handleR = new UINodeHandle(this._ref.app, cirlceBuffer, this, this);
        handleR.setPosition([this.width, this.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        handleR.setParent(this);
        this.elements.handles.R = [ handleR ];

        // this.addObjToRender(rect);
        // this.addObjsToRender([...this.handleL, ...this.handleR]);

        // console.log(this.obj);
        

        /* this is how txtArr obj looks like:
            const txtArr = [
                {
                data: "Param 1",
                pos: [0,0]   
                }, ...
            ]
       */

        // Render text
        this.txtArr = this.convertToTxtArr([
            {name: this.obj.name },
            {name: this.obj.id },
            //{name: "Parameters: " }, 
            // ...this.parameters.list
        ]);

        console.log(this.txtArr);

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, this.style.text.size, this._ref.UI.font, this.txtColor);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.marginX, this.marginY ]);
        txtBatch.setParent(this);

        // Create slider
        // const sliderContObjs = this.createSlider([1,1], this.container);

        // Create text boxes
        // this.txtBuffer = txtBatch;
        // this.txtBgArr = this.createTxtBg(txtBatch, this.parameters.list.length);
        // this.addObjsToRender([txtBatch]);
    }

    convertToTxtArr(txtIn)
    {
        const txtArr = [];

        this.numOfParams = 0;

        txtIn.forEach( (txt, indx) => {
                txtArr.push({
                    data: txt.name.toString(),
                    pos: [0, indx*this.style.text.paramTextOffsetY ]
                });
    
                this.numOfParams = this.numOfParams + 1;
        })
        return txtArr;
    }
}