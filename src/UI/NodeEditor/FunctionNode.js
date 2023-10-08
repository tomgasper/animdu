import { UINode } from "./UINode.js";
import { RenderableObject } from "../../RenderableObject.js";
import { createNewText } from "../../Text/textHelper.js";

import { hexToRgb } from "../../utils.js";

import { Effector } from "./Effector.js";

export class FunctionNode extends UINode
{
    effector = undefined;

    constructor(appRef, buffInfo, component, fnc)
    {
        super(appRef, buffInfo);

        this.addExtraParam({
            resolution: [this._ref.app.gl.canvas.width, this._ref.app.gl.canvas.height]
        });

        this.setFunction(fnc);

        this.component = component;

        this.initialize();
    }

    initialize()
    {
        // Set size based on the background container size
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;

        [this.style.container.width, this.style.container.height ] = [130,100];

        // Text
        const upscale = 2;
        this.style.body.text.colour = this._ref.UI.style.nodes.params.text.colour;
        this.style.body.text.size = 10;
        this.style.body.text.upscale = 2.0;
        
        const fontBody = this.style.body.text;

        // Stylize Node
        // this.style.body.text.lineOffset = this.style.container.width/2;
        this.style.margin.x = 10;
        this.style.margin.y = 10;

        this.style.container.colour = hexToRgb(this._ref.UI.style.nodes.fnc.container.colour);
        this.setOriginalColor(this.style.container.colour);


        // Retrieve previously initialized buffer
        /*
        const UINodeContainerBuffer = this._ref.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer);
        */

        // Set properties
        this.setPosition([0,0]);
        this.setScale([this.style.container.width/100,this.style.container.height/100]);

        // Set handlers
        this.handlers.onMouseMove = () => { this.handleMouseMove() };
        this.handlers.onClick = () => {
            document.getElementById("functionText").value = this.effector.fnc;
        }

        const handleStartY = this.style.margin.y + ( fontBody.size * 2 ) + this.style.body.margin.y;
        const offsetLine = this.style.body.text.size  + this.style.body.text.margin.y;

        this.addIOHandles("IN", this.effector.argc, this, handleStartY, offsetLine);
        this.addIOHandles("OUT", this.effector.outc, this, handleStartY, offsetLine);

        this.constructNodeBody();

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, this.style.body.text.size * upscale, fontBody.font, hexToRgb(fontBody.colour));
        txtBatch.setScale([0.5,0.5]);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ 0, 0 ]);
        txtBatch.setParent(this);

        this.setParent(this.component);

        this.elements.text = txtBatch;
    }

    createIOTxt(type, startX, startY, lineOffset)
    {
        if (type !== "IN" && type !== "OUT") throw new Error("Incorrect type of handle");

        const handles = this.component.elements.nodes[type];

        const txtArr = [];

        for (let i = 0; i < handles.length; i++)
        {
            txtArr.push(
                { data: type + "(" + i + ")", pos: [startX, startY + (i * lineOffset)] }
            )
        }

        return txtArr;
    }

    constructNodeBody()
    {
        const fontSize = this.style.body.text.size;

        const scale = this.style.body.text.upscale;
        let txtStartX = this.style.margin.x;
        let txtStartY = ( this.style.margin.y + fontSize + this.style.body.margin.y);
        let lineOffset = (fontSize + this.style.body.text.margin.y);
        let horizontalOffset = this.style.body.text.paramTextOffsetX + 5;

        txtStartX *= scale;
        txtStartY *= scale;
        lineOffset *= scale;
        // startOUTtxtX *= scale;
        // startOUTtxtY *= scale;

        // Render text
        this.txtArr = [
            { data: this.effector.name, pos: [0,0] },
            ...this.createIOTxt("IN", txtStartX, txtStartY, lineOffset),
            ...this.createIOTxt("OUT", txtStartX, txtStartY, lineOffset)
        ];
    }

    setFunction(effectorFnc)
    {
        console.log(effectorFnc);
        this.effector = eval(effectorFnc);
    }
}