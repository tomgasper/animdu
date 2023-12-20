import { RenderableObject } from "../../RenderableObject.js";
import { InstancedLineBuffer } from "../../Primitives/InstancedLineBuffer.js";
import { hexToRgb } from "../../utils.js";
import {  getPosFromMat } from "../../App/AppHelper.js";
import { m3, transformToParentSpace } from "../../utils.js";
import { UINodeParam } from "./UINodeParam.js";

import { Line } from "./NodeEditorTypes.js";

export class UINodeHandle extends RenderableObject
{
    // ref to scene object
    _ref : { [key : string] : any} = {
        app: undefined,
        UI: undefined
    };

    node : any;
    parent : any = undefined;
    parameter : UINodeParam | undefined;

    line : Line = {
        width: 3,
        data : [],
        obj : undefined,
        connection : {
            isConnected : false,
            type: undefined,
            connectedObj : undefined,
            animationBreak: 0.
        },
        update : this.updateLine
    }

    constructor(appRef, buffer, node , parent : RenderableObject | undefined)
    {
        // create renderable object
        super(buffer, undefined);

        this._ref.app = appRef;
        this._ref.UI = appRef.UI;

        // Set up handlers
        this.handlers.onMouseMove = (mousePos : number[] ) => this.handleHandleMouseMove(mousePos);
        this.handlers.onMouseUp = (objUnderMouseID : number) => this.handleHandleMouseUp(objUnderMouseID);

        if (parent) this.setParent(parent);
        if (node) this.node = node;
    }

    updateLine(line : Line, data : number [])
    {
        line.data = data;

        if (line.obj) line.obj.buffer.updatePointsBuffer(line.data);
        else console.log("Can't update line. No renderable object!");
    }

    createNewLine(mousePos : number [] )
    {
        // creating new line
        const thisObjPos : number [] = getPosFromMat(this);

        this.line.data = [thisObjPos[0],thisObjPos[1], mousePos[0], mousePos[1]];

        const lineBuffer = new InstancedLineBuffer(this._ref.app.gl, this._ref.app.programs[3], this.line.data, true);
        const line = new RenderableObject(lineBuffer, undefined);

        // Set parent - either UINodeEditor or UINode
        let parent = this.node.parent ? this.node.parent : this.node.container.parent;
        line.setParent(parent);

        let lineColour : number[] | undefined;
        let lineWidthVal : number | undefined;

        if (parent.type === "_EDITOR_NODE")
        {
            lineColour = hexToRgb(this._ref.UI.style.nodes.component.line.colour);
            lineWidthVal = 5;
        } else {
            lineColour = hexToRgb(this._ref.UI.style.nodes.general.line.colour);
            lineWidthVal = 3;
        }

        line.setOriginalColor(lineColour);

        // Add ref the new line
        if (parent.elements.lines)
        { 
            parent.elements.lines.push(line);
        }

        const lineWidthParam = {
            width : lineWidthVal
        };

        line.addExtraParam(lineWidthParam);

        // Save Ref to Renderable Object
        this.line.obj = line;
    }

    deleteLine(gl : WebGL2RenderingContext, line : Line)
    {
        const lineBuffer = line.obj.buffer;

        console.log("[WARNING]: Deleteing VAO and buffers for: " + lineBuffer);

        gl.deleteBuffer(lineBuffer.pointsBuffer);
        gl.deleteBuffer(lineBuffer.positionBuffer);
        gl.deleteVertexArray(lineBuffer.VAO);

        // Update children list of parent
        const lineParent = line.obj.parent;
        lineParent.deleteChild(line.obj);
        
        // Delete ref
        let parent = this.node.parent ? this.node.parent : this.node.container.parent;

        if (parent.elements.lines)
        {
            parent.elements.lines = parent.elements.lines.filter( (lineInComponent : RenderableObject ) => lineInComponent.id !== line.obj.id );
        }

        // Clean up ref object
        line.data = [];
        line.obj.buffer = undefined;
        line.obj = undefined;
    }

    handleHandleMouseUp(objUnderMouseID : number)
    {
        const objsToDraw = this._ref.app.sceneManager.getObjsToDraw();
        const objUnderMouseID2 = this._ref.app.sceneManager.getObjUnderMouseID();
        const objUnderMouse = this._ref.app.sceneManager.getObjByID(objUnderMouseID2);


        //const objUnderMouse = objsToDraw[this._ref.app.objUnderMouseArrIndx].objs[objUnderMouseID];

        if (objUnderMouse instanceof UINodeHandle && this != objUnderMouse)
        {
            const camera = this._ref.UI.viewer.camera;
            const camInv = m3.inverse(camera.matrix);

            this.handleObjConnection(this, objUnderMouse);

            const newCoords = m3.transformPoint(camInv, getPosFromMat(objUnderMouse.worldMatrix));
            const viewCoords = m3.multiply(camInv, objUnderMouse.worldMatrix);
            const objUnderMousePos = getPosFromMat(viewCoords);
            
            // center the line end
            if (!this.parent) {
                throw new Error("Object needs a parent!");
            }

            const componentViewer = this.parent.parent;
            const vecs = [ newCoords ];
            transformToParentSpace(componentViewer, vecs, true, undefined);

            let data = this.line.data;
            data = [data[0],data[1],vecs[0][0], vecs[0][1]];
            this.line.update(this.line, data);
        } else {
            // no handle under the mouse on release so get rid of preview line
            // handle disconect here
            if (this.line.connection.isConnected)
            {
                this.handleObjDisconnection(this.line.connection.connectedObj, true);
                this.handleObjDisconnection(this, true);
            } else this.deleteLine(this._ref.app.gl, this.line);
        }
    }

    handleHandleMouseMove(mousePos : number [])
    {
        // create new line if one doesn't exist yet
        if (!this.line.obj) this.createNewLine(mousePos);

        const componentViewer = this.parent.parent;

        const camera = this._ref.app.UI.viewer.camera;
        const camInv = m3.inverse(camera.matrix);
        const viewCoords = m3.multiply(camInv, this.worldMatrix);

        const vecs= [ [viewCoords[6], viewCoords[7]], mousePos ];
        
        transformToParentSpace(componentViewer, vecs, true , camInv );

        const data = [vecs[0][0], vecs[0][1], vecs[1][0], vecs[1][1]];
        this.line.update(this.line, data);
    }

    // connect logic
    connect(outHandle : UINodeHandle)
    {
        if (!outHandle) throw Error("Wrong handle!");

        this.line.connection.type = "IN";
        this.line.connection.connectedObj = outHandle;
        this.line.connection.isConnected = true;
        this.line.connection.animationBreak = 0.;

        return true;
    }

    disconnect(handle : UINodeHandle, deleteLine = true)
    {
        handle.line.connection.type = undefined;
        handle.line.connection.connectedObj = undefined;
        handle.line.connection.isConnected = false;
        handle.line.connection.animationBreak = 0.;

        if (handle.line.obj && deleteLine)
        {
            console.log("Deleting: " + handle.line);
            this.deleteLine(this._ref.app.gl, handle.line);
        }
    }

    handleObjDisconnection(handle : UINodeHandle, deleteLine : boolean)
    {
        this.disconnect(handle,deleteLine);

        // Call on disconnect callback
        handle.node.onDisconnect();
    }

    handleObjConnection(startObj : UINodeHandle, objToConnect : UINodeHandle)
    {
        // disconnect start handle and handle connected to it
        if (startObj.line.connection.isConnected === true)
        {
            if (startObj.line.connection.connectedObj)
            {
                this.disconnect(startObj.line.connection.connectedObj);
            }

            this.disconnect(startObj, false);
        }

        // disconnect end handle and handle connected to it
        if (objToConnect.line.connection.isConnected === true)
        {
            if (objToConnect.line.connection.connectedObj)
            {
                this.disconnect(objToConnect.line.connection.connectedObj);
            }

            this.disconnect(objToConnect);
        }

        // form a connection between nodes
        const canBeConnected : boolean = objToConnect.connect.call(objToConnect, this);

        if (canBeConnected)
        {
            this.line.connection.type = "OUT";
            this.line.connection.connectedObj = objToConnect;
            this.line.connection.isConnected = true;
        }

        // handle nodes callbacks
        startObj.node.onConnection(objToConnect.node);
        objToConnect.node.onConnection(startObj.node);
    }

    setParameter(param : UINodeParam)
    {
        if (!(param instanceof UINodeParam)) console.log('Error setting parameter, at: ' + this + "." + "Incorrect type: " + param);
        this.parameter = param;
    }

    setParameterVal(value : any)
    {
        if (!this.parameter) throw new Error("No parameter set for this UINodeHandle!");
        if (!value ) throw new Error("Trying to set undefined as parameter value [" + this.parameter.name + "]");

        this.parameter.value = value;
    }

    getLineConnectedHandle()
    {
        if (this.line.connection.isConnected && this.line.connection.connectedObj) return this.line.connection.connectedObj;
        else return undefined;
    }

    getLineConnectedNode()
    {
        if (this.line.connection.isConnected && this.line.connection.connectedObj) return this.line.connection.connectedObj.node;
        else return undefined;
    }
}

