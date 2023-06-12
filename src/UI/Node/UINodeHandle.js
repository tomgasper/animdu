import { RenderableObject } from "../../RenderableObject.js";
import { InstancedLineBuffer } from "../../Primitives/InstancedLineBuffer.js";

import { getProjectionMat } from "../../utils.js";

import { deleteFromToDraw, getPosFromMat } from "../../App/AppHelper.js";

export class UINodeHandle extends RenderableObject
{
    // ref to scene object
    scene = {};

    canMove = true;

    objToConnect = undefined;

    node = {}

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

        line.properties.width = this.line.width;

        this.line.obj = line;

        this.app.UI.addObj(this.line.obj);
    }

    deleteLine(gl, app, line)
    {
        const lineBuffer = line.obj.buffer;

        console.log("[WARNING]: Deleteing VAO and buffers for: " + lineBuffer);

        gl.deleteBuffer(lineBuffer.pointsBuffer);
        gl.deleteBuffer(lineBuffer.positionBuffer);
        gl.deleteVertexArray(lineBuffer.VAO);

        deleteFromToDraw(app.UI.objects, line);

        // clean up ref object
        line.data = [];
        line.obj.buffer = undefined;
        line.obj = undefined;
    }

    handleHandleMouseUp(objUnderMouseID)
    {
        const objUnderMouse = this.app.objsToDraw[objUnderMouseID];

        if (objUnderMouse instanceof UINodeHandle && this != objUnderMouse)
        {
            this.handleObjConnection(this, objUnderMouse);
            const objUnderMousePos = getPosFromMat(objUnderMouse);
            
            // center the line end
            let data = this.line.data;
            data = [data[0],data[1],objUnderMousePos[0], objUnderMousePos[1]];
            this.line.update(data);
        } else {
            // no handle under the mouse on release so get rid of preview line
            this.deleteLine(this.app.gl, this.app, this.line);
        }
    }

    handleHandleMouseMove(mousePos)
    {
        if (!this.canMove) return;

        // create new line if one doesn't exist yet
        if (!this.line.obj) this.createNewLine(mousePos);

        const data = [this.worldMatrix[6],this.worldMatrix[7], mousePos[0], mousePos[1]];
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
}

