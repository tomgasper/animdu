import { UINode } from "./UINode.js";
import { createNewText } from "../../Text/textHelper.js";

export class ParamNode extends UINode
{
    type = "INParamNode";
    indx = 0;

    name = "INParamNode";

    elements = {...this.elements,
        text: undefined
    }

    constructor(app, buffInfo, type, paramsList, name = "Node")
    {
        super(app, buffInfo, paramsList);

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
        /*
        const UINodeContainerBuffer = this._ref.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer);
        */

        this.setPosition([0,0]);
        this.setOriginalColor(this.style.container.colour);
        this.handlers.onMouseMove = () => { this.handleMouseMove()};

        // Save ref
        // this.container = rect;

        // Init graphical handlers
        // Render handle for each param to modify
        const handlesType = this.type === "INParamNode" ? "OUT" : "IN";
        this.addIOHandles(handlesType, this.parameters.list.length, this, this.style.text.paramTextOffsetY);

        /* this is how txtArr obj looks like:
            const txtArr = [
                {
                data: "Param 1",
                pos: [0,0]   
                }, ...
            ]
       */

        

        // Render text
        this.constructText();
        

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, this.style.text.size, this._ref.UI.font, this.style.text.colour);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.style.marginX, this.style.marginY ]);
        txtBatch.setParent(this);

        this.elements.text = txtBatch;
    }

    setType(type)
    {
        if (type === "IN") this.type = "INParamNode";
        else if (type === "OUT") this.type = "OUTParamNode";
        else throw new Error ("Setting incorrect ParamNode type! Must be IN or OUT type");
    }

    setIndx(indx)
    {
        if (Number.isInteger(indx))
        {
            this.indx = indx;
            this.name = this.type + indx.toString();
            this.updateText();
        }
    }

    constructText()
    {
        this.txtArr = [
            { data: this.name, pos: [0, 0 ] },
            ...this.convertToTxtArr(this.parameters.list, 0, this.style.text.paramTextOffsetY)
        ];
    }

    updateText()
    {
        this.constructText();
        this.elements.text.txtBuffer.updateTextBufferData(this.txtArr,10);
    }
}