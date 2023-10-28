import { UINode } from "./UINode.js";
import { createNewText } from "../../Text/textHelper.js";

import { hexToRgb } from "../../utils.js";
import { CustomBuffer } from "../../Primitives/CustomBuffer.js";
import { RenderableObject } from "../../RenderableObject.js";

export class ParamNode extends UINode
{
    type = "_NODE_PARAM_IN";
    indx = undefined;

    name = "ParamNode";

    elements = {...this.elements,
        text: undefined
    }

    constructor(app, buffInfo, type, paramsList, name = "Node")
    {
        super(app, buffInfo, paramsList);

        this.addExtraParam({
            resolution: [this._ref.app.gl.canvas.width, this._ref.app.gl.canvas.height]
        });

        this.setType(type);
        this.setName(name);

        this.initialize();
    }

    initialize()
    {
        // Save buffer ref
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.ObjNode;

        // Set appropriate style for the current node
        [this.style.container.width, this.style.container.height ] = [130, 100];
        this.style.container.colour = hexToRgb(this._ref.UI.style.nodes.params.container.colour);

        this.style.body.text.colour = this._ref.UI.style.nodes.params.text.colour;
        this.style.body.text.size = 8;
        this.style.body.text.upscale = 2.0;

        this.style.body.text.paramTextOffsetX = 50;

        this.style.heading.text.size = 9;
        this.style.heading.text.upscale = 2.0;

        this.style.margin.x = 10;
        this.style.margin.y = 10;

        // Aliases
        const fontBody = this.style.body.text;
        const fontHeading  = this.style.heading.text;

        // Set properties for the container
        this.setOriginalColor(this.style.container.colour);
        this.setPosition([0,0]);
        this.setScale([this.style.container.width/100, this.style.container.height/100]);

        // Assign handlers
        this.handlers.onMouseMove = () => { this.handleMouseMove()};

        // Create graphical handlers
        const handlesType = this.type === "_NODE_PARAM_IN" ? "OUT" : "IN";
        const handleStartY = this.style.margin.y + ( fontBody.size * 2 ) + this.style.body.margin.y;
        const offsetLine = this.style.body.text.size  + this.style.body.text.margin.y;
        this.addIOHandles(handlesType, this.parameters.length, this, handleStartY, offsetLine);

        // Create boxes that will sit behind text
        // Buffer is intitially empty and will be updated later oon
        const bgBoxesBuffer = new CustomBuffer(this._ref.app.gl, this._ref.app.programs[0], new Array(60).fill(0));
        this.bgTxtBoxes = new RenderableObject(bgBoxesBuffer);
        this.bgTxtBoxes.setCanBeMoved(false);
        this.bgTxtBoxes.setOriginalColor(hexToRgb("C1D2FB"));
        this.bgTxtBoxes.setPosition([0,0]);
        this.bgTxtBoxes.setParent(this);

        // Render text
        this.constructNodeBody();

        // Title font differ from body font
        const titleTxt = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.name, fontHeading.size*this.style.heading.text.upscale, fontHeading.font,hexToRgb(fontBody.colour) );
        titleTxt.setParent(this);
        titleTxt.setCanBeMoved(false);
        
        // Creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, fontBody.size*this.style.body.text.upscale, fontBody.font, hexToRgb(fontBody.colour));
        txtBatch.setCanBeMoved(false);
        txtBatch.setParent(this);

        // Created bigger font then scaled down to have a crispr image wheen zoomed in
        titleTxt.setScale([1/this.style.heading.text.upscale,1/this.style.heading.text.upscale ]);
        txtBatch.setScale([1/this.style.body.text.upscale, 1/this.style.body.text.upscale]);

        // Save refs
        this.elements.heading = titleTxt;
        this.elements.text = txtBatch;
    }

    setType(type)
    {
        if (type === "IN") this.type = "_NODE_PARAM_IN";
        else if (type === "OUT") this.type = "_NODE_PARAM_OUT";
        else throw new Error ("Setting incorrect ParamNode type! Must be IN or OUT type");
    }

    setIndx(indx)
    {
        if (Number.isInteger(indx))
        {
            this.indx = indx;
        }
    }

    setHeadingText(customStr)
    {
        if (customStr && typeof customStr == "string")
        {
            this.name = customStr
        }
        else 
        {
            let typeStr = "";
            if (this.type === "_NODE_PARAM_IN")
            {
                typeStr = "IN";
            } else if (this.type === "_NODE_PARAM_OUT") 
            {
                typeStr = "OUT";
            }

            this.name = typeStr + "(" + this.indx + ")";
        }
        this.updateText();
    }

    getCorrespondingComponentHandleIndx()
    {
        return this.indx;
    }

    getParams()
    {
        return this.parameters;
    }

    constructNodeBody()
    {
        const fontSize = this.style.body.text.size;

        const scale = this.style.body.text.upscale;
        const paramStartX = this.style.margin.x;
        const paramStartY = ( this.style.margin.y + fontSize + this.style.body.margin.y);
        const lineOffset = (fontSize + this.style.body.text.margin.y);
        const horizontalOffset = this.style.body.text.paramTextOffsetX + 5;

        this.txtArr = [
            { data: this.name, pos: [this.style.margin.x * scale, this.style.margin.y * scale ] },
            ...this.convertToTxtArr(this.parameters, lineOffset * scale, paramStartX * scale, horizontalOffset * scale, paramStartY * scale)
        ];

        const boxesArr = [];
        for (let i = 0; i < this.parameters.length; i++)
        {
            const l = this.style.body.text.paramTextOffsetX + this.style.margin.x;
            const r = l + 50;
            const t = paramStartY + (i*lineOffset);
            const b = paramStartY + (i*lineOffset+fontSize*scale*0.8);


            const boxVerts = this.constructBgBoxVerts(l, r, t,b);
            boxesArr.push(...boxVerts);
        }

        this.bgTxtBoxes.buffer.updatePositionBuffer(boxesArr);
    }

    constructBgBoxVerts(l,r,t,b)
    {
        const verts = [ l,t,
                        r,t,
                        l,b,

                        l,b,
                        r,b,
                        r,t
        ];

        return verts;
    }

    updateText()
    {
        this.constructNodeBody();
        this.elements.heading.buffer.updateTextBufferData([ this.txtArr[0] ], this.style.heading.text.size * this.style.heading.text.upscale);
        this.elements.text.buffer.updateTextBufferData(this.txtArr.slice(1, this.txtArr.length), this.style.body.text.size * this.style.body.text.upscale);
    }
}