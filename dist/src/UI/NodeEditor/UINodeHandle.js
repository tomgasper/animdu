import { RenderableObject } from "../../RenderableObject.js";
import { InstancedLineBuffer } from "../../Primitives/InstancedLineBuffer.js";
import { getProjectionMat, getViewCoords, hexToRgb } from "../../utils.js";
import { getPosFromMat } from "../../App/AppHelper.js";
import { m3, transformToParentSpace } from "../../utils.js";
import { UINodeParam } from "./UINodeParam.js";
export class UINodeHandle extends RenderableObject {
    constructor(app, buffer, node, parent) {
        // create renderable object
        super(buffer);
        // ref to scene object
        this.scene = {};
        this.canMove = true;
        this.objToConnect = undefined;
        this.node = {};
        this.parameter = undefined;
        this.line = {
            width: 3,
            data: [],
            obj: undefined,
            connection: {
                isConnected: false,
                type: undefined,
                connectedObj: undefined,
                animationBreak: 0.
            },
            update: this.updateLine
        };
        this.prevCrossOverIdx = -1;
        // save ref to app
        this.app = app;
        // Set up handlers
        this.handlers.onMouseMove = (mousePos) => this.handleHandleMouseMove(mousePos);
        this.handlers.onMouseUp = (objUnderMouseID) => this.handleHandleMouseUp(objUnderMouseID);
        if (parent) {
            this.setParent(parent);
        }
        if (node)
            this.node = node;
    }
    updateLine(data) {
        this.data = data;
        if (this.obj)
            this.obj.buffer.updatePointsBuffer(this.data);
        else
            console.log("Can't update line. The buffer hasn't been created yet!");
    }
    createNewLine(mousePos) {
        // creating new line
        const thisObjPos = getPosFromMat(this);
        this.line.data = [thisObjPos[0], thisObjPos[1], mousePos[0], mousePos[1]];
        const lineBuffer = new InstancedLineBuffer(this.app.gl, this.app.programs[3], this.line.data, true);
        const line = new RenderableObject(lineBuffer);
        // Set parent
        let parent = this.node.parent ? this.node.parent : this.node.container.parent;
        line.setParent(parent);
        let lineColour = undefined;
        let lineWidth = undefined;
        if (parent.type === "_EDITOR_NODE") {
            lineColour = hexToRgb(this.app.UI.style.nodes.component.line.colour);
            lineWidth = 5;
        }
        else {
            lineColour = hexToRgb(this.app.UI.style.nodes.general.line.colour);
            lineWidth = 3;
        }
        line.setOriginalColor(lineColour);
        // Add ref the new line
        if (parent.elements.lines) {
            parent.elements.lines.push(line);
        }
        line.name = "INSTANCED LINE!";
        line.properties.width = lineWidth;
        this.line.obj = line;
    }
    deleteLine(gl, app, line) {
        const lineBuffer = line.obj.buffer;
        console.log("[WARNING]: Deleteing VAO and buffers for: " + lineBuffer);
        gl.deleteBuffer(lineBuffer.pointsBuffer);
        gl.deleteBuffer(lineBuffer.positionBuffer);
        gl.deleteVertexArray(lineBuffer.VAO);
        // update children list of parent
        const lineParent = line.obj.parent;
        lineParent.deleteChild(line.obj);
        // delete ref
        let parent = this.node.parent ? this.node.parent : this.node.container.parent;
        if (parent.elements.lines) {
            parent.elements.lines = parent.elements.lines.filter((lineInComponent) => lineInComponent.id !== line.obj.id);
        }
        // clean up ref object
        line.data = [];
        line.obj.buffer = undefined;
        line.obj = undefined;
    }
    handleHandleMouseUp(objUnderMouseID) {
        const objUnderMouse = this.app.objsToDraw[this.app.objUnderMouseArrIndx].objs[objUnderMouseID];
        if (objUnderMouse instanceof UINodeHandle && this != objUnderMouse) {
            const camera = this.app.UI.viewer.camera;
            const camInv = m3.inverse(camera.matrix);
            this.handleObjConnection(this, objUnderMouse);
            const newCoords = m3.transformPoint(camInv, getPosFromMat(objUnderMouse.worldMatrix));
            const viewCoords = m3.multiply(camInv, objUnderMouse.worldMatrix);
            const objUnderMousePos = getPosFromMat(viewCoords);
            console.log(newCoords);
            // center the line end
            const componentViewer = this.parent.parent;
            const vecs = [newCoords];
            transformToParentSpace(componentViewer, vecs, true);
            let data = this.line.data;
            data = [data[0], data[1], vecs[0][0], vecs[0][1]];
            this.line.update(data);
        }
        else {
            // no handle under the mouse on release so get rid of preview line
            // yeah but we still got reference to old connection?
            // handle disconect here
            if (this.line.connection.isConnected) {
                this.handleObjDisconnection(this.line.connection.connectedObj, true);
                this.handleObjDisconnection(this, true);
            }
            else
                this.deleteLine(this.app.gl, this.app, this.line);
        }
    }
    handleHandleMouseMove(mousePos) {
        if (!this.canMove)
            return;
        console.log("MOVING!");
        // create new line if one doesn't exist yet
        if (!this.line.obj)
            this.createNewLine(mousePos);
        const componentViewer = this.parent.parent;
        const camera = this.app.UI.viewer.camera;
        const camInv = m3.inverse(camera.matrix);
        const viewCoords = m3.multiply(camInv, this.worldMatrix);
        const vecs = [[viewCoords[6], viewCoords[7]], mousePos];
        transformToParentSpace(componentViewer, vecs, true, camInv);
        const data = [vecs[0][0], vecs[0][1], vecs[1][0], vecs[1][1]];
        // const data = [this.worldMatrix[6], this.worldMatrix[7], vecs[0][0], vecs[0][1]];
        this.line.update(data);
    }
    // connect logic
    connect(outHandle) {
        if (!outHandle)
            throw Error("Wrong handle!");
        this.line.connection.type = "IN";
        this.line.connection.connectedObj = outHandle;
        this.line.connection.isConnected = true;
        this.line.connection.animationBreak = 0.;
        return true;
    }
    disconnect(handle, deleteLine = true) {
        handle.line.connection.type = undefined;
        handle.line.connection.connectedObj = undefined;
        handle.line.connection.isConnected = false;
        handle.line.connection.animationBreak = 0.;
        if (handle.line.obj && deleteLine) {
            console.log("Deleting: " + handle.line);
            this.deleteLine(this.app.gl, this.app, handle.line);
        }
    }
    handleObjDisconnection(handle, deleteLine) {
        this.disconnect(handle, deleteLine);
        // call on disconnect callback
        handle.node.onDisconnect();
    }
    handleObjConnection(startObj, objToConnect) {
        // disconnect start handle and handle connected to it
        if (startObj.line.connection.isConnected === true) {
            if (startObj.line.connection.connectedObj) {
                this.disconnect(startObj.line.connection.connectedObj);
            }
            this.disconnect(startObj, false);
        }
        // disconnect end handle and handle connected to it
        if (objToConnect.line.connection.isConnected === true) {
            if (objToConnect.line.connection.connectedObj) {
                this.disconnect(objToConnect.line.connection.connectedObj);
            }
            this.disconnect(objToConnect);
        }
        // form a connection between nodes
        const canBeConnected = objToConnect.connect.call(objToConnect, this);
        if (canBeConnected) {
            this.line.connection.type = "OUT";
            this.line.connection.connectedObj = objToConnect;
            this.line.connection.isConnected = true;
        }
        // handle nodes callbacks
        startObj.node.onConnection(objToConnect.node);
        objToConnect.node.onConnection(startObj.node);
    }
    setParameter(param) {
        if (!(param instanceof UINodeParam))
            console.log('Error setting parameter, at: ' + this + "." + "Incorrect type: " + param);
        this.parameter = param;
    }
    setParameterVal(value) {
        if (value)
            this.parameter.value = value;
        else
            throw new Error("Trying to set undefined as parameter value [" + this.parameter.name + "]");
    }
    getLineConnectedNode() {
        if (this.line.connection.isConnected && this.line.connection.connectedObj)
            return this.line.connection.connectedObj.node;
        else
            return undefined;
    }
}
//# sourceMappingURL=UINodeHandle.js.map