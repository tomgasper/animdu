import { UIObject } from "./UIObject.js";
import { CustomBuffer } from "../Primitives/CustomBuffer.js";
import { Component } from "./NodeEditor/Component.js";
import { hexToRgb } from "../utils.js";
export class UINodeEditor extends UIObject {
    type = "_EDITOR_NODE";
    name = "Node Editor";
    components = [];
    style = {
        ...this.style,
        container: {
            colour: undefined
        },
    };
    constructor(appRef, UIRef, dims) {
        // dims = [ (float)left, (float)right, (float)top, (float)bottom ]
        super(appRef, undefined);
        // need to save ref to UI manually as UI instance isn't attached to App instance yet
        this._ref.UI = UIRef;
        this.initialize(dims);
    }
    initialize(dims) {
        this.style.container.colour = hexToRgb(this._ref.UI.style.nodeViewer.container.colour);
        const editorDims = this.createContainer(dims);
        const nodeEditorBuffer = new CustomBuffer(this._ref.app.gl, this._ref.app.programs[0], editorDims);
        this.setBuffer(nodeEditorBuffer);
        this.setOriginalColor(this.style.container.colour);
        this.setCanBeMoved(false);
        this.setCanBeHighlighted(false);
    }
    createContainerVerts(dims) {
        const [left, right, top, bottom] = dims;
        // Install Container
        const customVertsPos = [left, top,
            right, top,
            right, bottom,
            right, bottom,
            left, bottom,
            left, top
        ];
        return customVertsPos;
    }
    createContainer(dims) {
        const [left, right, top, bottom] = dims;
        // Install Container
        const customVertsPos = [left, top,
            right, top,
            right, bottom,
            right, bottom,
            left, bottom,
            left, top
        ];
        return customVertsPos;
    }
    updateContainer(dims) {
        const newVerts = this.createContainerVerts(dims);
        this.buffer.updatePositionBuffer(newVerts);
    }
    addComponent(component) {
        if (!(component instanceof Component))
            throw Error("Incorrect Component type!");
        this.components.push(component);
    }
}
//# sourceMappingURL=UINodeEditor.js.map