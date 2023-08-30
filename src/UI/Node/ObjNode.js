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
    obj = undefined;

    constructor(obj, app, paramsList)
    {
        super(app,paramsList);

        this.obj = obj;
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.app.gl);

        // Set size based on the background container size
        this.UIBuffers = this.UI.UIBuffers.ObjNode;
        this.width = this.UIBuffers.container.size[0];
        this.height = this.UIBuffers.container.size[1];

        // Stylize Node
        this.paramTextOffsetX = this.width/2;
        this.marginX = this.width/10;
        this.marginY = this.height/10;

        const anchor = new TransformNode();

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

        // Render handle for each param to modify

        const paramsNum = this.parameters.list.length;

        for (let i = 0; i < paramsNum; i++)
        {
            const handleR = new UINodeHandle(this.app, cirlceBuffer, this, this.container);
            handleR.setPosition([this.width, this.marginY + ((i+2)*this.paramTextOffsetY + this.txtSize)]);
            handleR.setOriginalColor([0.2,0.2,0.2,1])
            handleR.setCanBeMoved(false);
            handleR.setParameter(this.parameters.list[i]);

            this.handleR.push(handleR);
        }

        const handleL = new UINodeHandle(this.app, cirlceBuffer, this, this.container);
        handleL.setPosition([0, this.height/2]);
        handleL.setOriginalColor([0.2,0.2,0.2,1])
        handleL.setCanBeMoved(false);
        this.handleL = [ handleL ];

        this.addObjToRender(rect);
        this.addObjsToRender([...this.handleL, ...this.handleR]);

        console.log(this.obj);
        

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
            {name: this.obj.id },
            {name: "Parameters: " }, 
            ...this.parameters.list
        ]);

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this.app.gl, this.app.programs[2], this.txtArr, this.txtSize, this.UI.font, this.txtColor);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.marginX, this.marginY ]);
        txtBatch.setParent(this.container);

        // Create slider
        // const sliderContObjs = this.createSlider([1,1], this.container);

        // Create text boxes
        // this.txtBuffer = txtBatch;
        // this.txtBgArr = this.createTxtBg(txtBatch, this.parameters.list.length);
        this.addObjsToRender([txtBatch]);
    }

    convertToTxtArr(txtIn)
    {
        const txtArr = [];

        this.numOfParams = 0;

        txtIn.forEach( (txt, indx) => {
                txtArr.push({
                    data: txt.name.toString(),
                    pos: [0, indx*this.paramTextOffsetY ]
                });
    
                this.numOfParams = this.numOfParams + 1;
        })
        return txtArr;
    }
}