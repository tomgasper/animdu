import { UINode } from "./UINode.js";
import { RenderableObject } from "../../RenderableObject.js";
import { createNewText } from "../../Text/textHelper.js";

import { hexToRgb } from "../../utils.js";

import { Effector } from "./Effector.js";

export class FunctionNode extends UINode
{
    effector = undefined;

    constructor(appRef, buffInfo, fnc)
    {
        super(appRef, buffInfo);

        this.setFunction(fnc);
    }

    initialize()
    {
        // Text
        this.style.text.body.colour = this._ref.UI.style.nodes.params.text.colour;
        const fontBody = this.style.text.body;

        // Set size based on the background container size
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;

        [this.style.container.width, this.style.container.height ] = this._ref.UIBuffers.container.size;

        // Stylize Node
        this.style.text.paramTextOffsetX = this.style.container.width/2;
        this.style.marginX = this.style.container.width/10;
        this.style.marginY = this.style.container.height/10;

        this.style.container.colour = hexToRgb(this._ref.UI.style.nodes.fnc.container.colour);
        this.setOriginalColor(this.style.container.colour);


        // Retrieve previously initialized buffer
        /*
        const UINodeContainerBuffer = this._ref.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer);
        */

        this.setPosition([0,0]);

        this.handlers.onMouseMove = () => { this.handleMouseMove() };
        this.handlers.onClick = () => {
            document.getElementById("functionText").value = this.effector.fnc;
        }

        // Save ref
        // this.container = rect;

        this.addIOHandles("IN", this.effector.argc, this, this.style.container.height/4 - this.style.text.body.size);
        this.addIOHandles("OUT", this.effector.outc, this, this.style.container.height/2 - this.style.text.body.size);
        
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
            { data: this.effector.name, pos: [0,0] },
            ...this.createIOTxt("IN"),
            ...this.createIOTxt("OUT")
        ];

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, fontBody.size, fontBody.font, hexToRgb(fontBody.colour));
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.style.marginX, this.style.marginY ]);
        txtBatch.setParent(this);

        this.elements.text = txtBatch;
    }

    createIOTxt(type, offset = 0)
    {
        const txtArr = [];

        if (type === "IN")
        {
            for (let i = 0; i < this.effector.argc; i++)
            {
                txtArr.push(
                    { data: "IN" + "(" + i + ")", pos: [10, this.style.container.height/4 + this.style.text.body.paramTextOffsetY * (i + offset) - this.style.text.body.size] }
                )
            }
        } else if (type === "OUT")
        {
            for (let i = 0; i < this.effector.outc; i++)
            {
                txtArr.push(
                    { data: "OUT" + "(" + i + ")", pos: [this.style.container.width-65, this.style.container.height/2 + this.style.text.body.paramTextOffsetY * (i + offset) - this.style.text.body.size ] }
                )
            }
        }

        return txtArr;
    }

    setFunction(effectorFnc)
    {
        console.log(effectorFnc);
        this.effector = eval(effectorFnc);
    }
}