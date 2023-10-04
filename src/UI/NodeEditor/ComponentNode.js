import { UINode } from "./UINode.js";
import { createNewText } from "../../Text/textHelper.js";

import { ObjNode } from "./ObjNode.js";

import { hexToRgb } from "../../utils.js";

export class ComponentNode extends UINode
{
    type = "ComponentNode";
    component = undefined;

    // NOTE:
    // elements.handles.R[0] and elements.handles.L[0] are RESERVED for passing through objects
    // and are exclusively for ObjNodes

    constructor(appRef,bufferInfo,component)
    {
        super(appRef, bufferInfo);

        this.addExtraParam({resolution: undefined});

        this.component = component;
    }

    initialize()
    {
        const fontBody = this.style.text.body;
        const fontHeading = this.style.text.heading;

        // Set size based on the background container size
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;

        this._ref.parent = this.component;

        [this.style.container.width, this.style.container.height ] = this._ref.UIBuffers.container.size;
        const inNum = this.component.elements.nodes.IN.length;
        const outNum = this.component.elements.nodes.OUT.length;

        // Stylize Node

        //Text
        this.style.text.paramTextOffsetX = this.style.container.width/2;

        // Container
        this.style.marginX = this.style.container.width/10;
        this.style.marginY = this.style.container.height/10;
        this.style.container.colour = hexToRgb(this._ref.UI.style.nodes.component.container.colour, 1);

        // Handles
        this.style.handles.offsetY = 20.;

        this.style.handles.L.position = [ 0, this.style.container.height/4 ];
        this.style.handles.R.position = [ this.style.container.width, this.style.container.height/2 ] ;

        // Save ref
        this.container = this.component;
        this.container.handlers.onMouseMove = () => this.handleMouseMove();

        this.container.setOnClick( () => console.log("hello!") );


        this.addIOHandles("IN", inNum, this.container, this.style.handles.L.position[1]);
        this.addIOHandles("OUT", outNum, this.container, this.style.handles.R.position[1]);
        
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
            { data: this.component.name, pos: [0,0] },
            ...this.createIOTxt("IN"),
            ...this.createIOTxt("OUT")
        ];

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, fontBody.size, fontBody.font, hexToRgb(fontBody.colour));
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.style.marginX, this.style.marginY ]);
        txtBatch.setParent(this.container);

        this.elements.text = txtBatch;
    }

    createIOTxt(type, offset = 0)
    {
        const inNum = this.component.elements.nodes.IN.length;
        const outNum = this.component.elements.nodes.OUT.length;

        const txtArr = [];

        if (type === "IN")
        {
            for (let i = 0; i < inNum; i++)
            {
                txtArr.push(
                    { data: "IN" + "(" + i + ")", pos: [10, this.style.container.height/4 + this.style.text.paramTextOffsetY * (i + offset) - this.style.text.size] }
                )
            }
        } else if (type === "OUT")
        {
            for (let i = 0; i < outNum; i++)
            {
                txtArr.push(
                    { data: "OUT" + "(" + i + ")", pos: [this.style.container.width-65, this.style.container.height/2 + this.style.text.paramTextOffsetY * (i + offset) - this.style.text.size ] }
                )
            }
        }

        return txtArr;
    }

    transformToNode(isNode)
    {
        // Change position of outgoing nodes

        let newHandleLPos, newHandleRPos;
        let newColour;

        if (isNode)
        {
            newHandleLPos = this.style.handles.L.position;
            newHandleRPos = this.style.handles.R.position;

            newColour = this.style.container.colour;
        } else 
        {
            newHandleLPos = [0, this.component.style.container.height/2 - this.style.text.body.size];
            newHandleRPos = [this.component.style.container.width, this.component.style.container.height/2 - this.style.text.body.size ];

            newColour = this.component.style.container.colour;
        }

        // Note that we are ignoring container here
        this.elements.handles.L.forEach( (handle,indx) => {
            handle.setVisible(true);
            handle.setPosition([newHandleLPos[0] , newHandleLPos[1] + this.style.handles.offsetY * indx]);
        });

        this.elements.handles.R.forEach( (handle, indx) => {
            handle.setVisible(true);
            handle.setPosition([newHandleRPos[0] , newHandleRPos[1] + this.style.handles.offsetY * indx]);
        });
        
        this.elements.text.setVisible(isNode);

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