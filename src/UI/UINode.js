import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";

import { UIObject } from "./UIObject.js";

import { RenderableObject } from "../Primitives/RenderableObject.js";

import { UINodeHandle } from "./UINodeHandle.js";
import { getPosFromMat } from "../sceneHelper.js";

export class UINode extends UIObject
{
    // Standard size
    height = undefined;
    width = undefined;

    scene = {};
    objsToRender = [];

    numOfParams = 0;
    paramTextOffsetY = 20;
    paramTextOffsetX = undefined;

    marginX = undefined;
    marginY = undefined;

    container = {};

    handleL = {};
    handleR = {};

    // array of objs
    // { 
    //  paramName: "string",
    //  value: "0"
    // }
    parameters = [];

    handleRLine = {
        obj: undefined,
        endpoint: [],
        data : [],
        width: 5,
        connectionId: -1,
        connection: {}
    };

    constructor(scene)
    {
        super();

        this.scene = scene;

        this.initialize();
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.scene.gl);

        const containerColor = [0.05,0.5,0.95,1];

        this.UIBuffers = this.scene.UIBuffers.UINode;
        this.width = this.UIBuffers.container.size[0];
        this.height = this.UIBuffers.container.size[1];

        this.paramTextOffsetX = this.width/2;

        this.marginX = this.width/10;
        this.marginY = this.height/10;

        const UINodeContainerBuffer = this.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UINodeContainerBuffer, projectionMat);
        rect.setPosition([0,0]);
        rect.setOriginalColor(containerColor);
        rect.handlers.onMouseMove = () => { this.handleMouseMove() };

        this.container = rect;

        const cirlceBuffer = this.UIBuffers.handle.buffer.getInfo();

        const handleR = new UINodeHandle(this.scene, cirlceBuffer, this, this.container);
        handleR.setPosition([this.width, this.height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        this.handleR = handleR;

        const handleL = new UINodeHandle(this.scene, cirlceBuffer, this, this.container);
        handleL.setPosition([0, this.height/2]);
        handleL.setOriginalColor([0.2,0.2,0.2,1])
        handleL.setCanBeMoved(false);
        this.handleL = handleL;

        this.addObjToRender(rect);
        this.addObjsToRender([handleL, handleR]);

        const UINodeText = [
            {
                paramName: "First",
                value: "0"
            },
            {
                paramName: "Second",
                value: "0"
            },
            {
                paramName: "Thirdoo",
                value: "0"
            }
        ];

        this.UINodeText = UINodeText;

    //     const txtArr = [
    //         {
    //         data: "Param 1",
    //         pos: [0,0]   
    //        },
    //        {
    //        data: "Param 2",
    //        pos: [0,20]   
    //        },
    //        {
    //        data: "Param 3",
    //        pos: [0,40]   
    //        },
    //        {
    //        data: "Param 4",
    //        pos: [0,60]
    //        },
    //    ]

        this.txtArr = this.convertToTxtArr(UINodeText);

       // creating batch for this node
        const txtSize = 9.0;
        const txtColor = [1,1,1,1];
        const txtBatch = createNewText(this.scene.gl, this.scene.programs[2], this.txtArr, txtSize, this.scene.fontUI, txtColor);
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.marginX, this.marginY ]);
        txtBatch.setParent(this.container);

        this.txtBuffer = txtBatch;

        this.txtBgArr = this.createTxtBg(txtBatch, UINodeText.length);

        this.addObjsToRender([...this.txtBgArr, txtBatch]);

        // this.parameter.X.container.handlers.onClick = () => {
        //     if (this.handleR.line.connection.isConnected)
        //     {
        //         console.log(this.handleR.line.connection.connectedObj.node);
        //         this.handleR.line.connection.connectedObj.node.parameter.X.changeValue("HELLO G!");
        //     }
        // }


        console.log(this);

        this.addTextEntry("New param!", txtBatch);
    }

    convertToTxtArr(UINodeText)
    {
        const txtArr = [];

        this.numOfParams = 0;

        UINodeText.forEach( (txt, indx) => {
            txtArr.push({
                data: txt.paramName,
                pos: [0, indx*this.paramTextOffsetY ]
            },
            {
                data: txt.value,
                pos: [this.paramTextOffsetX, indx*this.paramTextOffsetY]
            });

            this.numOfParams = this.numOfParams + 1;
        })
        return txtArr;
    }

    addTextEntry(paramNameStr, parent = this.container)
    {
        // Init UI text input
        // const txtWidth = txt.txtBuffer.str.cpos[0];
        // const txtHeight = txt.txtBuffer.str.rect[3];

        // remove objs
        this.removeObjs(this.scene, [this.txtBuffer, ...this.txtBgArr]);
        this.numOfParams = 0;

        this.UINodeText.push(
            {
                paramName: paramNameStr,
                value: "0"
            }
        );

        const newTxtBg = this.createTxtBg(parent, this.UINodeText.length);
        this.txtBgArr = newTxtBg;

        const newTxtArr = this.convertToTxtArr(this.UINodeText);
        this.txtBuffer.txtBuffer.updateTextBufferData(newTxtArr, 9);
        this.container.updateWorldMatrix();

        this.addObjsToRender([...newTxtBg, this.txtBuffer]);
    }

    createTxtBg(parent = this.container, n)
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

    addNewTxtBg(parent, indx)
    {
        const buffer = this.UIBuffers.textInput.buffer;

        const rect = new RenderableObject(buffer.getInfo(), getProjectionMat(this.scene.gl));
        rect.setPosition([this.paramTextOffsetX, indx*this.paramTextOffsetY]);
        rect.setParent(parent);
        rect.setCanBeMoved(false);
        rect.setOriginalColor([0.05,0.05,0.6,1]);

        rect.handlers.onInputKey = (e) => this.handleInput(e, indx);

        return rect;
    }

    handleInput(e,indx)
    {
        if (this.UINodeText[indx].value === "0")
        {
            this.UINodeText[indx].value = e.key;
        }
        else {
            this.UINodeText[indx].value = this.UINodeText[indx].value + e.key;
        }

        const newTextArr = this.convertToTxtArr(this.UINodeText);            
        this.txtBuffer.txtBuffer.updateTextBufferData(newTextArr, 9);
    }

    addTextBatch()
    {
        // array of objects that have properties str and pos
    }

    handleMouseMove()
    {
        const handles = [this.handleR, this.handleL];

        handles.forEach( (handle) => {
            const isConnectedIN = handle.line.connection.type == "IN" ? true : false;

            // return if there's nothing to update
            if (!isConnectedIN && !handle.line.obj) return;

            let data;
            let objToUpdate;
            const connectedObj = handle.line.connection.connectedObj;
            const connectedObjPos = getPosFromMat(connectedObj);
            const handlePos = getPosFromMat(handle);

            if (isConnectedIN === true)
            {
                data = [connectedObjPos[0], connectedObjPos[1], handlePos[0], handlePos[1]];
                objToUpdate = connectedObj.line;
            } else 
            {
                data = [handlePos[0], handlePos[1], connectedObjPos[0], connectedObjPos[1]];
                objToUpdate = handle.line;
            }

            objToUpdate.update.call(objToUpdate, data);
        })
    }

    setPosition(pos)
    {
        this.container.setPosition(pos);
        this.container.updateWorldMatrix();
    }
}