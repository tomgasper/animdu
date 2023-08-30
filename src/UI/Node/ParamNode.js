import { getProjectionMat } from "../../utils.js";
import { UINode } from "./UINode.js";

import { RenderableObject } from "../../RenderableObject.js";
import { UINodeHandle } from "./UINodeHandle.js";

import { createNewText } from "../../Text/textHelper.js";
import { UINodeParamList } from "./UINodeParamList.js";
import { UINodeParam } from "./UINodeParam.js";

import { TransformNode } from "../../Node/TransformNode.js";

export class ParamNode extends UINode
{
    type = undefined;

    constructor(app, type, paramsList)
    {
        super(app,paramsList);

        this.setType(type);
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

        // Retrieve previously initialized buffer
        const UINodeContainerBuffer = this.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer, projectionMat);
        rect.setPosition([0,0]);
        rect.setOriginalColor(this.containerColor);
        rect.handlers.onMouseMove = () => { this.handleMouseMove() };

        // Save ref
        this.container = rect;

        // Init graphical handlers
        // Render handle for each param to modify
        const handlesType = this.type === "IN" ? "OUT" : "IN";
        this.addIOHandles(handlesType, this.parameters.list.length, this.paramTextOffsetY);


        // Push to draw list
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
        this.txtArr = [
            { data: this.type, pos: [0, 0 ] },
            ...this.convertToTxtArr(this.parameters.list, 0, this.paramTextOffsetY)
        ];

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

    setType(type)
    {
        this.type = type;
    }
}