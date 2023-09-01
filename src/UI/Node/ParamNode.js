import { UINode } from "./UINode.js";
import { RenderableObject } from "../../RenderableObject.js";
import { createNewText } from "../../Text/textHelper.js";

export class ParamNode extends UINode
{
    type = undefined;

    constructor(app, type, paramsList, name = "Node")
    {
        super(app,paramsList);

        this.setType(type);
        this.setName(name);
    }

    initialize()
    {
        // Set size based on the background container size
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.ObjNode;

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
        rect.handlers.onMouseMove = () => { this.handleMouseMove()
        };

        // Save ref
        this.container = rect;

        // Init graphical handlers
        // Render handle for each param to modify
        const handlesType = this.type === "IN" ? "OUT" : "IN";
        this.addIOHandles(handlesType, this.parameters.list.length, this.container, this.style.text.paramTextOffsetY);

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
            ...this.convertToTxtArr(this.parameters.list, 0, this.style.text.paramTextOffsetY)
        ];

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, this.style.text.size, this._ref.UI.font, this.style.text.colour);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.style.marginX, this.style.marginY ]);
        txtBatch.setParent(this.container);
    }

    setType(type)
    {
        this.type = type;
    }
}