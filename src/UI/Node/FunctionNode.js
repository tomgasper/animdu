import { UINode } from "./UINode.js";
import { RenderableObject } from "../../RenderableObject.js";
import { createNewText } from "../../Text/textHelper.js";

import { Effector } from "./Effector.js";

export class FunctionNode extends UINode
{
    effector = undefined;

    constructor(appRef, fnc)
    {
        super(appRef);

        this.setFunction(fnc);
    }

    initialize()
    {
        // Set size based on the background container size
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;

        [this.style.container.width, this.style.container.height ] = this._ref.UIBuffers.container.size;

        // Stylize Node
        this.style.text.paramTextOffsetX = this.style.container.width/2;
        this.style.marginX = this.style.container.width/10;
        this.style.marginY = this.style.container.height/10;

        // Retrieve previously initialized buffer
        const UINodeContainerBuffer = this._ref.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer);
        rect.setPosition([0,0]);
        rect.setOriginalColor(this.style.container.colour);

        rect.handlers.onMouseMove = () => { this.handleMouseMove() };
        rect.handlers.onClick = () => {
            document.getElementById("functionText").value = this.effector.fnc;
        }

        // Save ref
        this.container = rect;

        this.addIOHandles("IN", this.effector.argc, this.container, this.style.container.height/4 - this.style.text.size);
        this.addIOHandles("OUT", this.effector.outc, this.container, this.style.container.height/2 - this.style.text.size);
        
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
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, this.style.text.size, this._ref.UI.font, this.style.text.colour);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.style.marginX, this.style.marginY ]);
        txtBatch.setParent(this.container);
    }

    createIOTxt(type, offset = 0)
    {
        const txtArr = [];

        if (type === "IN")
        {
            for (let i = 0; i < this.effector.argc; i++)
            {
                txtArr.push(
                    { data: "IN" + "(" + i + ")", pos: [10, this.style.container.height/4 + this.style.text.paramTextOffsetY * (i + offset) - this.style.text.size] }
                )
            }
        } else if (type === "OUT")
        {
            for (let i = 0; i < this.effector.outc; i++)
            {
                txtArr.push(
                    { data: "OUT" + "(" + i + ")", pos: [this.style.container.width-65, this.style.container.height/2 + this.style.text.paramTextOffsetY * (i + offset) - this.style.text.size ] }
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