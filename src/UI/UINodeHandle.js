import { RenderableObject } from "../Primitives/RenderableObject.js";
import { InstancedLineBuffer } from "../Primitives/InstancedLineBuffer.js";

import { getProjectionMat } from "../utils.js";

import { deleteFromToDraw, getPosFromMat } from "../sceneHelper.js";

export class UINodeHandle extends RenderableObject
{
    // ref to scene object
    scene = {};

    canMove = true;

    objToConnect = undefined;

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

    constructor(scene, buffer, parent)
    {
        // create renderable object
        super(buffer, getProjectionMat(scene.gl));

        // save ref to scene
        this.scene = scene;

        // Set up handlers
        this.handlers.onMouseMove = (mousePos) => this.handleHandleMouseMove(mousePos);
        this.handlers.onMouseUp = (objUnderMouseID) => this.handleHandleMouseUp(objUnderMouseID);

        console.log(this.container);

        if (parent)
        {
            this.setParent(parent);
        }

    }

    updateLine(data)
    {
        console.log("updating line!");

        this.data = data;

        if (this.obj) this.obj.buffer.updatePointsBuffer(this.data);
        else console.log("Can't update line. The buffer hasn't been created yet!");
    }

    createNewLine(mousePos)
    {
        if (this.line.connection.isConnected)
        {
            this.disconnect(this.line.connection.connectedObj);
        }

        // creating new line
        const thisObjPos = getPosFromMat(this);

        this.line.data = [thisObjPos[0],thisObjPos[1], mousePos[0], mousePos[1]];

        const lineBuffer = new InstancedLineBuffer(this.scene.gl, this.scene.programs[3], this.line.data,true);
        const line = new RenderableObject(lineBuffer.getInfo(), getProjectionMat(this.scene.gl), lineBuffer);

        line.properties.width = this.line.width;

        this.line.obj = line;

        this.scene.addObjToScene([this.line.obj]);
    }

    deleteLine(gl, scene, line)
    {
        const lineBuffer = line.obj.buffer;

        console.log("[WARNING]: Deleteing VAO and buffers for: " + lineBuffer);

        gl.deleteBuffer(lineBuffer.pointsBuffer);
        gl.deleteBuffer(lineBuffer.positionBuffer);
        gl.deleteVertexArray(lineBuffer.VAO);

        deleteFromToDraw(scene.objsToDraw, line);

        // clean up ref object
        line.data = [];
        line.obj.buffer = undefined;
        line.obj = undefined;
    }

    handleHandleMouseUp(objUnderMouseID)
    {
        const objUnderMouse = this.scene.objsToDraw[objUnderMouseID];

        if (objUnderMouse instanceof UINodeHandle)
        {
            this.handleObjConnection(objUnderMouse);

            const objUnderMousePos = getPosFromMat(objUnderMouse);
            
            // center the line end
            let data = this.line.data;
            data = [data[0],data[1],objUnderMousePos[0], objUnderMousePos[1]];
            this.line.update(data);
        } else {
            // no handle under the mouse on release so get rid of preview line
            this.deleteLine(this.scene.gl, this.scene, this.line);
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

        if (this.line.obj) this.deleteLine(this.scene.gl, this.scene, this.line);

        this.line.connection.type = "IN";
        this.line.connection.connectedObj = outHandle;
        this.line.connection.isConnected = true;

        return true;
    }

    disconnect(handle)
    {
        handle.line.connection.type = undefined;
        handle.line.connection.connectedObj = undefined;
        handle.line.connection.isConnected = false;

        if (handle.line.obj)
        {
            console.log("Deleting: " + handle.line);
            this.deleteLine(this.scene.gl, this.scene, handle.line);
        }
    }

    handleObjConnection(objToConnect)
    {
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
