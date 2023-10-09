import { UINode } from "./UINode.js";
import { createNewText } from "../../Text/textHelper.js";

import { ObjNode } from "./ObjNode.js";

import { hexToRgb } from "../../utils.js";

export class ComponentNode extends UINode
{
    type = "_NODE_COMPONENT";
    component = undefined;

    // NOTE:
    // elements.handles.R[0] and elements.handles.L[0] are RESERVED for passing through objects
    // and are exclusively for ObjNodes

    constructor(appRef,bufferInfo,component)
    {
        super(appRef, bufferInfo);

        this.addExtraParam({resolution: undefined});

        this.component = component;

        this.initialize();
    }

    initialize()
    {
        // Style
        [this.style.container.width, this.style.container.height ] = [130,130];
        this.style.container.colour = hexToRgb(this._ref.UI.style.nodes.component.container.colour, 1);

        this.style.body.text.upscale = 2.0;
        this.style.heading.text.upscale = 2.0;

        this.style.heading.text.size = 10;
        this.style.body.text.size = 9;

        this.style.body.text.paramTextOffsetX = this.style.container.width/2;

        this.style.margin.x = 10;
        this.style.margin.y = 5;

        this.style.handles.offsetY = 20.;
        this.style.handles.L.position = [ 0, this.style.container.height/4 ];
        this.style.handles.R.position = [ this.style.container.width, this.style.container.height/2 ] ;

        const fontBody = this.style.body.text;
        const fontHeading = this.style.heading.text;

        // Refs
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;
        this._ref.parent = this.component;

        this.container = this.component;

        // Handlers
        this.container.handlers.onMouseMove = () => this.handleMouseMove();
        this.container.setOnClick( () => console.log("hello!") );

        this.constructNodeBody();

        // Text
        const bodyTxt = this.txtArr;
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], bodyTxt, fontBody.size * this.style.body.text.upscale, fontBody.font, hexToRgb(fontBody.colour));
        txtBatch.setCanBeMoved(false);
        txtBatch.setScale([ 1/this.style.body.text.upscale,1/this.style.body.text.upscale ]);
        txtBatch.setPosition([ 0,0 ]);
        txtBatch.setParent(this.container);

        this.elements.text = txtBatch;
    }

    constructNodeBody()
    {
        const fontSize = this.style.body.text.size;

        const scale = this.style.body.text.upscale;
        let txtStartX = this.style.margin.x;
        let txtStartY = ( this.style.margin.y + fontSize + this.style.body.margin.y);
        let lineOffset = (fontSize + this.style.body.text.margin.y);
        let horizontalOffset = this.style.body.text.paramTextOffsetX + 5;

        const txtWidth = 5 * fontSize;
        let startOUTtxtX = ( this.style.container.width - this.style.margin.x - txtWidth );
        let startOUTtxtY = this.style.container.height/2;

        this.style.handles.L.position = [0, txtStartY + fontSize];
        this.style.handles.R.position = [this.style.container.width, startOUTtxtY + fontSize];

        this.style.lineOffset = lineOffset;

        txtStartX *= scale;
        txtStartY *= scale;
        lineOffset *= scale;
        startOUTtxtX *= scale;
        startOUTtxtY *= scale;

        const nodesINTxt = this.createIOTxt("IN", txtStartX, txtStartY, lineOffset);
        const nodesOUTxt = this.createIOTxt("OUT", startOUTtxtX, startOUTtxtY, lineOffset);

        this.txtArr = [
            ...nodesINTxt,
            ...nodesOUTxt
        ];

        // add handles
        const inNum = this.component.elements.nodes.IN.length;
        const outNum = this.component.elements.nodes.OUT.length + 1;

        // this.addIOHandles("IN", 1, this.container, 0, 0);
        this.addIOHandles("IN", inNum, this.container, this.style.handles.L.position[1], lineOffset);
        
        // this.addIOHandles("OUT", 1, this.container, 0,0);
        this.addIOHandles("OUT", outNum, this.container, this.style.handles.R.position[1], lineOffset);
    }

    createIOTxt(type, startX, startY, lineOffset)
    {
        if (type !== "IN" && type !== "OUT") throw new Error("Incorrect type of handle");

        const handles = this.component.elements.nodes[type];
        const num = (type === "IN") ? handles.length - 1 : handles.length;

        const txtArr = [];

        for (let i = 0; i < num; i++)
        {
            txtArr.push(
                { data: type + "(" + i + ")", pos: [startX, startY + (i * lineOffset)] }
            )
        }

        return txtArr;
    }

    transformToNode(isNode)
    {
        // Change position of outgoing nodes

        let newHandleLPos, newHandleRPos;
        let newAnimHandleLPos, newAnimHandleRPos;
        let newHandleSize;
        let newColour;

        const upscale = this.container.style.heading.text.upscale ? this.container.style.heading.text.upscale : 1.0; 

        const headingTxt = this.container.elements.heading;

        if (isNode)
        {
            const animHandleYPos = this.style.margin.y+this.style.heading.text.size;

            newHandleLPos = this.style.handles.L.position;
            newHandleRPos = this.style.handles.R.position;
            newAnimHandleLPos = [0,animHandleYPos];
            newAnimHandleRPos = [this.style.container.width,animHandleYPos];
            newHandleSize = [1.2,1.2];

            newColour = this.style.container.colour;

            headingTxt.setScale([0.8/upscale,0.8/upscale]);
            headingTxt.setPosition([this.style.margin.x, this.style.margin.y]);
        } else 
        {
            const animHandleYPos = (this.component.style.margin.y+this.component.style.heading.text.size/2)*upscale;

            newHandleLPos = [0, this.component.style.container.height/2 - this.component.style.body.text.size];
            newHandleRPos = [this.component.style.container.width, this.component.style.container.height/2 - this.component.style.body.text.size ];
            newAnimHandleLPos = [0,animHandleYPos];
            newAnimHandleRPos = [this.component.style.container.width,animHandleYPos];
            newHandleSize = [1.5,1.5];

            newColour = this.component.style.container.colour;

            headingTxt.setScale([1/upscale,1/upscale]);
            headingTxt.setPosition([this.container.style.margin.x*upscale, this.container.style.margin.y*upscale]);
        }


        this.elements.handles.L[0].setPosition(newAnimHandleLPos);
        this.elements.handles.L[0].setVisible(true);
        this.elements.handles.L[0].setScale(newHandleSize);
        for (let i = 0; i < this.elements.handles.L.length-1; i++)
        {
            const handle = this.elements.handles.L[i+1];

            handle.setVisible(true);
            handle.setPosition([newHandleLPos[0] , newHandleLPos[1] + this.style.lineOffset * i]);
        }

        this.elements.handles.R[0].setPosition(newAnimHandleRPos);
        this.elements.handles.R[0].setVisible(true);
        this.elements.handles.R[0].setScale(newHandleSize);
        for (let i = 0; i < this.elements.handles.R.length-1; i++)
        {
            const handle = this.elements.handles.R[i+1];

            handle.setVisible(true);
            handle.setPosition([newHandleRPos[0] , newHandleRPos[1] + this.style.lineOffset*i]);
        }
        
        this.elements.text.setVisible(isNode);
        // this.elements.heading.setVisible(true);

        this.container.setOriginalColor(newColour);
        // this.container.children.forEach( (child) => child.setVisible(isVisible)) ;
    }

    onConnection(anotherNode)
    {

        if (anotherNode instanceof ObjNode)
        {
            this.component.setActiveObj(anotherNode.obj);
        } else if (anotherNode instanceof ComponentNode)
        {   
            if (anotherNode.component.activeObj)
            {
                // copy ref to obj
                this.component.setActiveObj(anotherNode.component.activeObj);
            }
            
        }
    }

    onDisconnect()
    {
        // to do
        console.log("disconnecting: " + this.component.name);
    }
}