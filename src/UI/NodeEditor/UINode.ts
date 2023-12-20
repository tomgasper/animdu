import { getProjectionMat, hexToRgb } from '../../utils';

import { UIObject } from '../UIObject';

import { RenderableObject } from '../../RenderableObject';

import { UINodeHandle } from './UINodeHandle';
import { getPosFromMat } from '../../App/AppHelper';

import { transformToParentSpace } from '../../utils';
import { Line } from './NodeEditorTypes';
import { UINodeParam } from './UINodeParam';

import { TextArray, LineConnection } from './NodeEditorTypes';

import { Style } from './NodeEditorStyleTypes';
import { GeometryObject } from '../../GeometryObject';

export class UINode extends UIObject
{
    type : string;
    parameters : UINodeParam[];

    style : Style = {
        container :
        {
            width: undefined,
            height: undefined,
            colour: "464646",
            margin:
            {
                x: 0,
                y: 0
            }
        },
        margin:
        {
            x: undefined,
            y: undefined
        },
        heading: {
            text: {
                font: undefined,
                size: 9,
                colour: "FFFFFF",
                lineOffset: 20,
                paramTextOffsetY: 20,
                paramTextOffsetX: undefined,
                margin:
                {
                    x: 0,
                    y: 8,
                },
                upscale : 1
            }
        },
        body:
        {
            margin:
            {
                x: 0,
                y: 15,
            },
            text:
            {
                font: undefined,
                size: 9,
                colour: "FFFFFF",
                lineOffset: 20,
                paramTextOffsetY: 20,
                paramTextOffsetX: undefined,
                margin:
                {
                    x: 0,
                    y: 8,
                },
                upscale : 1
            }
        },
        handles:
        {
            L:
            {
                colour: undefined,
                position: undefined
            },
            R:
            {
                colour: undefined,
                position:undefined
            }
        }
    }

    elements : { [key: string] : any} =
    {
        handles:
        {
            L : [],
            R: []
        }
    }

    // array of objs
    // { 
    //  paramName: "string",
    //  value: "0"
    // }

    constructor(appRef, buffInfo)
    {
        super(appRef, buffInfo);

        this._ref = {
            ...this._ref,
            component: undefined
        };

        this.setStyle(appRef);
    }

    protected setStyle(appRef)
    {
        // Assign default fonts for UINode
        this.style.heading.text.font = appRef.UI.style.nodes.general.heading.text.font;
        this.style.heading.text.size = appRef.UI.style.nodes.general.heading.text.size;
        this.style.heading.text.colour = appRef.UI.style.nodes.general.heading.text.colour;

        this.style.body.text.font = appRef.UI.style.nodes.general.body.text.font;
        this.style.body.text.size = appRef.UI.style.nodes.general.body.text.size;
        this.style.body.text.colour = appRef.UI.style.nodes.general.body.text.colour;

        this.style.handles.L.colour =  hexToRgb(this._ref.UI.style.nodes.params.container.colour);
        this.style.handles.R.colour =  hexToRgb(this._ref.UI.style.nodes.params.container.colour);
    }

    /*
    createBatchText(txtArr, textSize)
    {
        // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], txtArr, textSize, this._ref.UI.font, this.txtColor);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.marginX, this.marginY ]);
        txtBatch.setParent(this);

        return txtBatch;
    }
    */

    convertToTxtArr(params : UINodeParam[], lineOffset, offX = 0, offX2 = 0, offY = 0)
    {
        const txtArr : TextArray[] = [];

        params.forEach( (txt, indx) => {
            let paramValue : number | any[] = txt.value;
            if (Array.isArray(txt.value)) paramValue = txt.value.map( val => val.toFixed(1) );


                txtArr.push({
                    data: txt.name.toString(),
                    pos: [0+offX, (indx*lineOffset) + offY ]
                },
                {
                    data: paramValue.toString(),
                    pos: [offX + offX2, (indx*lineOffset) + offY]
                });
    
        })
        return txtArr;
    }

    getConnection(side : string,indx : number) : LineConnection
    {
        if (side !== "L" && side !== "R") throw new Error("Incorrect side specifier - must be 'L' or 'R', provided: " + side);
        const handle = this.elements.handles[side];

        if (!handle[indx]) throw new Error("Handle with index: " + indx + " doesn't exist!");

        return handle[indx].line.connection;
    }

    getConnectedNode(side : string,indx : number)
    {
        const connection : LineConnection = this.getConnection(side,indx);

        if (!connection.isConnected)
        {
            console.log("Node is not connected!");
            return undefined;
        }

        if (!connection.connectedObj || !connection.connectedObj.node )
        {
            console.log("Node is not connected!");
            return undefined;
        }

        return connection.connectedObj.node;
    }

    getType()
    {
        return this.type;
    }

    /*
    addParam(paramNameStr, parent = this)
    {
        // Init UI text input
        // const txtWidth = txt.txtBuffer.str.cpos[0];
        // const txtHeight = txt.txtBuffer.str.rect[3];

        // remove objs
        this.removeObjs(this.app, [this.txtBuffer, ...this.txtBgArr]);

        this.parameters.addNewParam(
            new UINodeParam(paramNameStr)
        );

        const newTxtBg = this.createTxtBg(parent, this.parameters.list.length);
        this.txtBgArr = newTxtBg;

        const newTxtArr = this.convertToTxtArr(this.parameters.list);
        this.txtBuffer.txtBuffer.updateTextBufferData(newTxtArr, 9);
        this.container.updateWorldMatrix();
    }
    */

    getSize() : number []
    {
        if (!this.style.container.width || !this.style.container.height)
        {
            throw new Error("Width and height must be defined");
        }
        
        return [this.style.container.width, this.style.container.height];
    }

    /*
    createTxtBg(parent = this, n)
    {
        const buffer = this.UIBuffers.textInput.buffer;

        const arrOfTxtBgs = [];

        for (let i=0; i < n; i++)
        {
            const rect = this.addNewTxtBg(parent, i);
            arrOfTxtBgs.push(rect);
        }

        return arrOfTxtBgs;
    }
    */

    
    createSlider(sliderBuffer : any, size = [1,1], parent = this)
    {
        // Set up bg for slider
        if (!this.style.container.width || this.style.container.height)
        {
            console.error("Width or height not specifed!");
            return;
        }

        if (!this.style.body.text.paramTextOffsetY)
        {
            console.error("Line offset not specified!");
            return;   
        }

        const sliderBgBuffer = sliderBuffer.sliderBg.buffer.getInfo();
        const sliderBgSize = sliderBuffer.sliderBg.size;

        const sliderBg = new RenderableObject(sliderBgBuffer, getProjectionMat(this._ref.app.gl));
        const paramsNum = this.parameters.length;
        const pos = [(this.style.container.width-sliderBgSize[0])/2, paramsNum*this.style.body.text.paramTextOffsetY+sliderBgSize[1]/2];

        sliderBg.setPosition(pos);
        sliderBg.setCanBeMoved(false);
        sliderBg.setCanBeHighlighted(false);
        sliderBg.setParent(parent);

        // Set up circle
        const circleBuffer = sliderBuffer.sliderCircle.buffer.getInfo();
        const sliderCircle = new RenderableObject(circleBuffer, getProjectionMat(this._ref.app.gl));
        sliderCircle.setScale(size);
        sliderCircle.setCanBeMoved(true);
        sliderCircle.setPosition([0,sliderBgSize[1]/2]);
        sliderCircle.setOriginalColor([0,0,0,1]);
        sliderCircle.setParent(sliderBg);

        const moveRestriction = {x: [0,100], y: [sliderBgSize[1]/2,sliderBgSize[1]/2] };
        sliderCircle.addExtraParam(moveRestriction);

        return [sliderBg, sliderCircle];
    }

    /*
    handleInput(e : KeyboardEvent,indx : number)
    {
        const paramTextToChange = this.parameters[indx].value;
        const incomingKey = e.key;

        const newString = this.changeValueNumeric(paramTextToChange, incomingKey);
        if (newString) paramTextToChange = newString;

        const newTextArr = this.convertToTxtArr(this.parameters);            
        this.txtBuffer.txtBuffer.updateTextBufferData(newTextArr, 9);
    }
    */

    handleMouseMove()
    {
        const handles = [...this.elements.handles.L, ...this.elements.handles.R];

        // To do - extend comp work area
        /*
        if (this.properties.position[0] < 0)
        {
            let x = this.properties.position[0];

            const sw = this.parent.style.container.width/100;
            const sh = this.parent.style.container.height/100;

            const p = this.properties.position;
            const pp = this.parent.properties.position;

            console.log(sw + " " + sh);

            this.parent.setScale([sw+Math.abs(x/100), sh]);
            this.setPosition([p[0] - x, p[1]]);
            this.setPosition([pp[0] + x, pp[1]]);
        }
        */

        for (let i = 0; i < handles.length; i++)
        {
            let handle : UINodeHandle = handles[i];

            const isConnectedIN = handle.line.connection.type == "IN" ? true : false;

            // return if there's nothing to update
            if (!isConnectedIN && !handle.line.obj) continue;

            let data : number[];
            let objToUpdate : Line;
            const connectedObj : UINodeHandle | undefined = handle.getLineConnectedHandle() as UINodeHandle | undefined; // as ... can be erased after upgrading UINodeHandle to ts

            if (!connectedObj)
            {
                console.error("No connected node!");
                continue;
            }

            let connectedObjPos : number [] = getPosFromMat(connectedObj);
            let handlePos : number [] = getPosFromMat(handle);

            // center the line end
            const parent = this.parent ? this.parent : this._ref.UI.viewer;

            const vecs= [ connectedObjPos, handlePos ];
            transformToParentSpace(parent, vecs, true, undefined);
            [ connectedObjPos, handlePos ] = vecs;

            if (isConnectedIN === true)
            {
                data = [connectedObjPos[0], connectedObjPos[1], handlePos[0], handlePos[1]];
                if (!connectedObj.line)
                {
                    console.error("Incorrect connection");
                    continue;
                }
                objToUpdate = connectedObj.line;
            } else 
            {
                data = [handlePos[0], handlePos[1], connectedObjPos[0], connectedObjPos[1]];
                objToUpdate = handle.line;
            }

            objToUpdate.update(objToUpdate, data);
        }

    }

    setVisibleNode(isVisible : boolean)
    {
        this.setVisible(isVisible);
        this.children.forEach( (child : GeometryObject) => child.setVisible(isVisible)) ;
    }
    
    createHandle(pos : number [], parent : RenderableObject, parameter : UINodeParam | undefined)
    {
        const cirlceBuffer = this._ref.UIBuffers.handle.buffer;

        const handle = new UINodeHandle(this._ref.app, cirlceBuffer, this, this.container);
        handle.setParent(parent);
        handle.setPosition(pos);
        handle.setOriginalColor([0.2,0.2,0.2,1])
        handle.setCanBeMoved(false);

        if (parameter)
        {
            handle.setParameter(parameter);
        }

        return handle;
    }

    addIOHandles(type : string, handleNum : number, parent : RenderableObject, offsetY : number = 0, lineOffset : number)
    {
        if (!this.style.container.width)
        {
            console.error("Container width not specified!");
            return;
        }

        let offsetX : number;
        let arrToPush: UINodeHandle[];

        if (type === "IN")
        {
            offsetX = 0;
            arrToPush = this.elements.handles.L;
        } else if (type === "OUT")
        {
            offsetX = this.style.container.width;
            arrToPush = this.elements.handles.R;
        } else {
            console.error("Invalid handle type- must be IN or OUT");
            return;
        }

        for (let i = 0; i < handleNum; i++)
        {
            const pos = [offsetX, offsetY + (lineOffset * i)];
            let param : UINodeParam | undefined;

            if (this.parameters && this.parameters[i])
            {
                param = this.parameters[i];
            }
            
            const newHandle = this.createHandle(pos, parent, param);
            arrToPush.push(newHandle);
        }
    }

    onConnection(anotherNode)
    {

    }

    onDisconnect()
    {

    }
}