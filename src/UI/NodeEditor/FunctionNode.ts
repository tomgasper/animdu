import { UINode } from './UINode';
import { createNewText } from '../../Text/textHelper';
import { hexToRgb } from '../../utils';
import { Effector } from './Effector';
import { UINodeParam } from './UINodeParam';
import { TextData } from './TextData';
import { Component } from './Component';

export class FunctionNode extends UINode
{
    effector : Effector;
    parameters : UINodeParam [] = [];
    txtArr : TextData[];

    component : Component;

    constructor(appRef, buffInfo, component : Component, effector : Effector)
    {
        super(appRef, buffInfo);

        this.addExtraParam({
            resolution: [this._ref.app.gl.canvas.width, this._ref.app.gl.canvas.height]
        });

        this.setEffector(effector);

        this.component = component;
        this.elements = {
            ...this.elements,
            text : undefined
        };

        this.initialize();
    }

    initialize()
    {
        // Ref to the buffer
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;

        // Set style
        [this.style.container.width, this.style.container.height ] = [130,100];
        this.style.container.colour = this._ref.UI.style.nodes.fnc.container.colour;

        this.style.body.text.size = 8;
        this.style.body.text.upscale = 2.0;
        this.style.body.text.colour = this._ref.UI.style.nodes.params.text.colour;

        this.style.heading.text.size = 9;
        this.style.heading.text.upscale = 2.0;

        this.style.container.margin.x = 6;
        this.style.container.margin.y = 10;

        // Aliases
        const upscale = this.style.body.text.upscale;
        const fontBody = this.style.body.text;
        const fontHeading = this.style.heading.text;

        const program = this._ref.app.programs[2];

        // Set properties for the container
        this.setScale([this.style.container.width/100,this.style.container.height/100]);
        this.setPosition([0,0]);
        this.setOriginalColor(hexToRgb(this.style.container.colour));

        // Set handlers
        this.handlers.onMouseMove = () => { this.handleMouseMove() };
        this.handlers.onClick = () => {
            const windowInput : HTMLInputElement = document.getElementById("functionText") as HTMLInputElement;
            if (!windowInput) return;
            windowInput.value = this.effector.fnc;
        }

        // Create graphical handlers
        const handleStartY = this.style.container.margin.y + ( fontBody.size * 2 ) + this.style.body.margin.y!;
        const offsetLine = this.style.body.text.size  + this.style.body.text.margin.y!;
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

        // Save ref
        this.elements.text = txtBatch;
    }

    private createIOTxt(type : string, num : number, startX : number, startY : number, lineOffset : number) : TextData[]
    {
        if (type !== "IN" && type !== "OUT") throw new Error("Incorrect type of handle");

        const txtArr : TextData[] = [];

        for (let i = 0; i < num; i++)
        {
            const str = `${type} (${i})`;
            const pos = [startX, startY + (i * lineOffset)];
            txtArr.push(
                new TextData(str,pos)
            )
        }

        return txtArr;
    }

    private constructNodeBody() : void
    {
        if (this.style.body.margin.y == undefined || this.style.body.margin.x == undefined || this.style.body.text.margin.y == undefined) throw new Error("Style not specified");
        //if (this.style.body.text.paramTextOffsetX == undefined ) throw new Error("Style not specified");

        const fontSize = this.style.body.text.size;

        const upscale = this.style.body.text.upscale;
        let startINtxtX = this.style.container.margin.x!;
        let startINtxtY = ( this.style.container.margin.y! + fontSize + this.style.body.margin.y);
        let lineOffset = (fontSize + this.style.body.text.margin.y);
        // let horizontalOffset = this.style.body.text.paramTextOffsetX + 5;

        const txtWidth = 5 * fontSize;
        let startOUTtxtX = ( this.style.container.width! - this.style.container.margin.x! - txtWidth );
        let startOUTtxtY = this.style.container.height!/2;

        startINtxtX *= upscale;
        startINtxtY *= upscale;
        lineOffset *= upscale;
        startOUTtxtX *= upscale;
        startOUTtxtY += upscale;

        // Render text
        this.txtArr = [
            { data: this.effector.name, pos: [this.style.container.margin.x!*upscale,this.style.container.margin.y!*upscale] },
            ...this.createIOTxt("IN", this.effector.argc, startINtxtX, startINtxtY, lineOffset),
            ...this.createIOTxt("OUT", this.effector.outc, startOUTtxtX, startINtxtY,  lineOffset)
        ];
    }

    public setFunction(effectorFnc : string)
    {
        if (!effectorFnc || !(typeof effectorFnc === "string")) throw new Error("Incorrect input type");

        this.effector.fnc = eval(effectorFnc);
    }

    public setEffector(effector : Effector)
    {
        if (!effector || !(effector instanceof Effector)) throw new Error("Incorrect input type");

        this.effector = effector;
    }
}