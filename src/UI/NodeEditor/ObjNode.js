import { UINode } from "./UINode.js";

import { UINodeHandle } from "./UINodeHandle.js";

import { createNewText } from "../../Text/textHelper.js";

import { hexToRgb } from "../../utils.js";

export class ObjNode extends UINode
{
    type = "ObjNode";
    obj = undefined;

    constructor(appRef, buffInfo, obj, paramsList)
    {
        super(appRef, buffInfo, paramsList);

        this.addExtraParam({resolution: [this._ref.app.gl.canvas.width, this._ref.app.gl.canvas.height]});

        this.obj = obj;
    }

    initialize()
    {
        const fontBody = this.style.text.body;
        const fontHeading = this.style.text.heading;

        // Set size based on the background container size
        this.UIBuffers = this._ref.UI.UIBuffers.ObjNode;
        this.width = this.UIBuffers.container.size[0];
        this.height = this.UIBuffers.container.size[1];

        // Stylize Node
        this.paramTextOffsetX = this.width/2;
        this.marginX = this.width*0.15;
        this.marginY = this.height*0.15;

        this.setOriginalColor(this.style.container.colour);

        this.setPosition([0,0]);
        this.handlers.onMouseMove = () => { this.handleMouseMove() };

        // Save ref
        // this.container = rect;

        // Init graphical handlers
        const cirlceBuffer = this.UIBuffers.handle.buffer.getInfo();

        const handleR = new UINodeHandle(this._ref.app, cirlceBuffer, this, this);
        handleR.setPosition([this.width, this.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        handleR.setParent(this);
        this.elements.handles.R = [ handleR ];

        // this.addObjToRender(rect);
        // this.addObjsToRender([...this.handleL, ...this.handleR]);

        // console.log(this.obj);
        

        /* this is how txtArr obj looks like:
            const txtArr = [
                {
                data: "Param 1",
                pos: [0,0]   
                }, ...
            ]
       */

        // Render text
        this.txtArr = this.convertToTxtArr([
            {name: this.obj.name },
            //{name: "Parameters: " }, 
            // ...this.parameters.list
        ]);

        console.log(this.txtArr);

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, 22, fontHeading.font, hexToRgb(fontHeading.colour));
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.marginX, this.marginY ]);
        txtBatch.setScale([0.5,0.5]);
        txtBatch.setParent(this);

        // Create slider
        // const sliderContObjs = this.createSlider([1,1], this.container);

        // Create text boxes
        // this.txtBuffer = txtBatch;
        // this.txtBgArr = this.createTxtBg(txtBatch, this.parameters.list.length);
        // this.addObjsToRender([txtBatch]);
    }

    convertToTxtArr(txtIn)
    {
        const txtArr = [];

        this.numOfParams = 0;

        txtIn.forEach( (txt, indx) => {
                txtArr.push({
                    data: txt.name.toString(),
                    pos: [0, indx*this.style.text.body.paramTextOffsetY ]
                });
    
                this.numOfParams = this.numOfParams + 1;
        })
        return txtArr;
    }
}