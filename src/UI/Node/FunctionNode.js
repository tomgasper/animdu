import { getProjectionMat } from "../../utils.js";
import { UINode } from "./UINode.js";

import { RenderableObject } from "../../RenderableObject.js";
import { UINodeHandle } from "./UINodeHandle.js";

import { createNewText } from "../../Text/textHelper.js";

import { Effector } from "./Effector.js";

export class FunctionNode extends UINode
{
    effector = undefined;

    constructor(app, fnc)
    {
        super(app);

        this.setFunction(fnc);
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.app.gl);

        // Set size based on the background container size
        this.UIBuffers = this.UI.UIBuffers.UINode;
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

        /*
        const handleR = new UINodeHandle(this.app, cirlceBuffer, this, this.container);
        handleR.setPosition([this.width, this.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        this.handleR = [ handleR ];

        const handleL = new UINodeHandle(this.app, cirlceBuffer, this, this.container);
        handleL.setPosition([0, this.height/4]);
        handleL.setOriginalColor([0.2,0.2,0.2,1])
        handleL.setCanBeMoved(false);
        this.handleL = [ handleL ];

        */

        this.addIOHandles("IN", this.effector.argc, this.height/4 - this.txtSize);
        this.addIOHandles("OUT", this.effector.outc, this.height/2 - this.txtSize);



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
            { data: this.effector.name, pos: [this.marginX,0] },
            ...this.createIOTxt("IN"),
            ...this.createIOTxt("OUT")
        ]

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this.app.gl, this.app.programs[2], this.txtArr, this.txtSize, this.UI.font, this.txtColor);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ 0, 0 ]);
        txtBatch.setParent(this.container);

        // Create slider
        // const sliderContObjs = this.createSlider([1,1], this.container);

        // Create text boxes
        // this.txtBuffer = txtBatch;
        // this.txtBgArr = this.createTxtBg(txtBatch, this.parameters.list.length);
        this.addObjsToRender([txtBatch]);
    }

    createIOTxt(type)
    {
        const txtArr = [];

        if (type === "IN")
        {
            for (let i = 0; i < this.effector.argc; i++)
            {
                txtArr.push(
                    { data: "IN" + "(" + i + ")", pos: [10, this.height/4 + this.paramTextOffsetY * i ] }
                )
            }
        } else if (type === "OUT")
        {
            for (let i = 0; i < this.effector.outc; i++)
            {
                txtArr.push(
                    { data: "OUT" + "(" + i + ")", pos: [this.width-50, this.height/2 + this.paramTextOffsetY * i ] }
                )
            }
        }

        return txtArr;
    }

    setFunction(effectorFnc)
    {
        console.log(effectorFnc);
        this.effector = effectorFnc;
    }
}