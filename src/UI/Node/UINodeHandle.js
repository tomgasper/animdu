import { RenderableObject } from "../../RenderableObject.js";
import { InstancedLineBuffer } from "../../Primitives/InstancedLineBuffer.js";

import { getProjectionMat } from "../../utils.js";

import {  getPosFromMat } from "../../App/AppHelper.js";

import { m3, transformToParentSpace } from "../../utils.js";

export class UINodeHandle extends RenderableObject
{
    // ref to scene object
    scene = {};

    canMove = true;

    objToConnect = undefined;

    node = {};

    parameter = undefined;

    line = {
        width: 5,
        data : [],
        obj : undefined,
        connection : {
            isConnected : false,
            type: undefined,
            connectedObj : undefined
        },
        update : this.updateLine
    }

    prevCrossOverIdx = -1;

    constructor(app, buffer, node, parent)
    {
        // create renderable object
        super(buffer, getProjectionMat(app.gl));

        // save ref to app
        this.app = app;

        // Set up handlers
        this.handlers.onMouseMove = (mousePos) => this.handleHandleMouseMove(mousePos);
        this.handlers.onMouseUp = (objUnderMouseID) => this.handleHandleMouseUp(objUnderMouseID);

        if (parent)
        {
            this.setParent(parent);
        }

        if (node)
        this.node = node;

    }

    updateLine(data)
    {
        this.data = data;

        if (this.obj) this.obj.buffer.updatePointsBuffer(this.data);
        else console.log("Can't update line. The buffer hasn't been created yet!");
    }

    createNewLine(mousePos)
    {
        // creating new line
        const thisObjPos = getPosFromMat(this);

        this.line.data = [thisObjPos[0],thisObjPos[1], mousePos[0], mousePos[1]];

        const lineBuffer = new InstancedLineBuffer(this.app.gl, this.app.programs[3], this.line.data, true);
        const line = new RenderableObject(lineBuffer.getInfo(), getProjectionMat(this.app.gl), lineBuffer);

        // Set parent
        if (this.node.container.parent) line.setParent(this.node.container.parent);
        else line.setParent(this.app.UI.viewer.container);
        
        line.name = "INSTANCED LINE!";

        line.properties.width = this.line.width;

        this.line.obj = line;
    }

    deleteLine(gl, app, line)
    {
        const lineBuffer = line.obj.buffer;

        console.log("[WARNING]: Deleteing VAO and buffers for: " + lineBuffer);

        gl.deleteBuffer(lineBuffer.pointsBuffer);
        gl.deleteBuffer(lineBuffer.positionBuffer);
        gl.deleteVertexArray(lineBuffer.VAO);

        // update children list of parent
        const lineParent = line.obj.parent;
        lineParent.deleteChild(line.obj);
        

        // clean up ref object
        line.data = [];
        line.obj.buffer = undefined;
        line.obj = undefined;
    }

    handleHandleMouseUp(objUnderMouseID)
    {
        const objUnderMouse = this.app.objsToDraw[this.app.objUnderMouseArrIndx].objs[objUnderMouseID];

        if (objUnderMouse instanceof UINodeHandle && this != objUnderMouse)
        {
            this.handleObjConnection(this, objUnderMouse);
            const objUnderMousePos = getPosFromMat(objUnderMouse);
            
            // center the line end
            const componentViewer = this.parent.parent;
            const vecs= [ objUnderMousePos ];
            transformToParentSpace(componentViewer, vecs);

            let data = this.line.data;
            data = [data[0],data[1],vecs[0][0], vecs[0][1]];
            this.line.update(data);
        } else {
            // no handle under the mouse on release so get rid of preview line
            this.deleteLine(this.app.gl, this.app, this.line);
        }
    }

    handleHandleMouseMove(mousePos)
    {
        if (!this.canMove) return;

        console.log("MOVING!");

        // create new line if one doesn't exist yet
        if (!this.line.obj) this.createNewLine(mousePos);

        const componentViewer = this.parent.parent;
        const vecs= [ [this.worldMatrix[6], this.worldMatrix[7]],
                        mousePos ];
        
        transformToParentSpace(componentViewer, vecs);

        const data = [vecs[0][0], vecs[0][1], vecs[1][0], vecs[1][1]];
        this.line.update(data);
    }

    // connect logic
    connect(outHandle)
    {
        if (!outHandle) throw Error("Wrong handle!");

        this.line.connection.type = "IN";
        this.line.connection.connectedObj = outHandle;
        this.line.connection.isConnected = true;

        console.log("connected");

        console.log(outHandle);
        console.log(this);

        return true;
    }

    disconnect(handle, deleteLine = true)
    {
        handle.line.connection.type = undefined;
        handle.line.connection.connectedObj = undefined;
        handle.line.connection.isConnected = false;

        if (handle.line.obj && deleteLine)
        {
            console.log("Deleting: " + handle.line);
            this.deleteLine(this.app.gl, this.app, handle.line);
        }
    }

    handleObjConnection(startObj, objToConnect)
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
        const canBeConnected = objToConnect.connect.call(objToConnect, this);

        if (canBeConnected)
        {
            this.line.connection.type = "OUT";
            this.line.connection.connectedObj = objToConnect;
            this.line.connection.isConnected = true;
        }
    }

    setParameter(param)
    {
        this.parameter = param;
    }
}

