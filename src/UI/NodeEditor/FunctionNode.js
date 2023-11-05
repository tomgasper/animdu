import { UINode } from "./UINode.js";
import { createNewText } from "../../Text/textHelper.js";
import { hexToRgb } from "../../utils.js";
import { Effector } from "./Effector.js";
import { UINodeParam } from "./UINodeParam.js";

export class FunctionNode extends UINode
{
    effector = undefined;
    parameters = [];

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
        // Ref to the buffer
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;

        // Set style
        [this.style.container.width, this.style.container.height ] = [130,100];
        this.style.container.colour = hexToRgb(this._ref.UI.style.nodes.fnc.container.colour);

        this.style.body.text.size = 8;
        this.style.body.text.upscale = 2.0;
        this.style.body.text.colour = this._ref.UI.style.nodes.params.text.colour;

        this.style.heading.text.size = 9;
        this.style.heading.text.upscale = 2.0;

        this.style.margin.x = 10;
        this.style.margin.y = 10;

        // Aliases
        const upscale = this.style.body.text.upscale;
        const fontBody = this.style.body.text;
        const fontHeading = this.style.heading.text;

        const program = this._ref.app.programs[2];

        // Set properties for the container
        this.setScale([this.style.container.width/100,this.style.container.height/100]);
        this.setPosition([0,0]);
        this.setOriginalColor(this.style.container.colour);

        // Set handlers
        this.handlers.onMouseMove = () => { this.handleMouseMove() };
        this.handlers.onClick = () => {
            document.getElementById("functionText").value = this.effector.fnc;
        }

        // Create graphical handlers
        const handleStartY = this.style.margin.y + ( fontBody.size * 2 ) + this.style.body.margin.y;
        const offsetLine = this.style.body.text.size  + this.style.body.text.margin.y;
        this.addIOHandles("IN", this.effector.argc, this, handleStartY, offsetLine);
        this.addIOHandles("OUT", this.effector.outc, this, handleStartY, offsetLine);

        this.constructNodeBody();

        // Text
        const titleStr = [this.txtArr[0]];
        const bodyStr = this.txtArr.slice(1, this.txtArr.length);

        const titleTxt = createNewText(this._ref.app.gl, program, titleStr, fontHeading.size*upscale, fontHeading.font,hexToRgb(fontBody.colour) );
        titleTxt.setParent(this);
        titleTxt.setScale([1/upscale,1/upscale]);
        titleTxt.setCanBeMoved(false);

        // Batch text
        const txtBatch = createNewText(this._ref.app.gl, program, bodyStr, this.style.body.text.size * upscale, fontBody.font, hexToRgb(fontBody.colour));
        txtBatch.setScale([1/upscale,1/upscale]);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ 0, 0 ]);
        txtBatch.setParent(this);

        this.setParent(this.component);

        this.elements.text = txtBatch;
    }

    createIOTxt(type, num, startX, startY, lineOffset)
    {
        if (type !== "IN" && type !== "OUT") throw new Error("Incorrect type of handle");

        const txtArr = [];

        for (let i = 0; i < num; i++)
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

        const upscale = this.style.body.text.upscale;
        let txtStartX = this.style.margin.x;
        let txtStartY = ( this.style.margin.y + fontSize + this.style.body.margin.y);
        let lineOffset = (fontSize + this.style.body.text.margin.y);
        let horizontalOffset = this.style.body.text.paramTextOffsetX + 5;

        const txtWidth = 5 * fontSize;
        let startOUTtxtX = ( this.style.container.width - this.style.margin.x - txtWidth );
        let startOUTtxtY = this.style.container.height/2;

        txtStartX *= upscale;
        txtStartY *= upscale;
        lineOffset *= upscale;
        startOUTtxtX *= upscale;
        startOUTtxtY += upscale;

        // Render text
        this.txtArr = [
            { data: this.effector.name, pos: [this.style.margin.x*upscale,this.style.margin.y*upscale] },
            ...this.createIOTxt("IN", this.effector.argc, txtStartX, txtStartY, lineOffset),
            ...this.createIOTxt("OUT", this.effector.outc, startOUTtxtX, txtStartY, lineOffset)
        ];
    }

    setFunction(effectorFnc)
    {
        console.log(effectorFnc);
        this.effector = eval(effectorFnc);
    }
}