import { UINode } from "./UINode.js";
import { RenderableObject } from "../../RenderableObject.js";
import { createNewText } from "../../Text/textHelper.js";

import { ObjNode } from "./ObjNode.js";

export class ComponentNode extends UINode
{
    component = undefined;

    // NOTE:
    // elements.handles.R[0] and elements.handles.L[0] are RESERVED for passing through objects
    // and are exclusively for ObjNodes

    constructor(appRef,bufferInfo,component)
    {
        super(appRef, bufferInfo);

        this.component = component;
    }

    initialize()
    {
        // Set size based on the background container size
        this._ref.UIBuffers = this._ref.app.UI.UIBuffers.UINode;

        this._ref.parent = this.component;

        [this.style.container.width, this.style.container.height ] = this._ref.UIBuffers.container.size;
        const inNum = this.component.elements.nodes.IN.length;
        const outNum = this.component.elements.nodes.OUT.length;

        // Stylize Node
        this.style.text.paramTextOffsetX = this.style.container.width/2;
        this.style.marginX = this.style.container.width/10;
        this.style.marginY = this.style.container.height/10;

        this.style.handles.L.position = [ 0, this.style.container.height/4 ];
        this.style.handles.R.position = [ this.style.container.width, this.style.container.height/2 ] ;

        // Save ref
        this.container = this.component;
        this.container.handlers.onMouseMove = () => this.handleMouseMove();


        this.addIOHandles("IN", inNum + 2 , this.container, this.style.handles.L.position[1]);
        this.addIOHandles("OUT", outNum + 2, this.container, this.style.handles.R.position[1]);
        
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
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, this.style.text.size, this._ref.UI.font, this.style.text.colour);
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

        if (isNode)
        {
            newHandleLPos = this.style.handles.L.position;
            newHandleRPos = this.style.handles.R.position;
        } else 
        {
            newHandleLPos = [0, this.component.style.container.height/2 - this.style.text.size];
            newHandleRPos = [this.component.style.container.width, this.component.style.container.height/2 - this.style.text.size ];
        }

        // Note that we are ignoring container here
        this.elements.handles.L.forEach( handle => {
            handle.setVisible(true);
            handle.setPosition(newHandleLPos);
        });

        this.elements.handles.R.forEach( handle => {
            handle.setVisible(true);
            handle.setPosition(newHandleRPos);
        });
        
        this.elements.text.setVisible(isNode);
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