import { getProjectionMat } from "../utils.js";
import { createNewText } from "../Text/textHelper.js";
import { UIObject } from "./UIObject.js";
import { changeValueNumeric } from "../utils.js";
import { hexToRgb } from "../utils.js";
export class UITextInput extends UIObject {
    constructor(appRef, rect, txtSize, parent, value = "Input text", size = [100, 50]) {
        super(appRef, rect);
        this.height = 50;
        this.width = 100;
        this.containerBuffer = undefined;
        this.active = false;
        this.value = "Put text here!";
        this.handlers = Object.assign(Object.assign({}, this.handlers), { onValueChange: undefined });
        this.parent = {};
        this.txtObj = {};
        this.container = {};
        // style
        this.height = txtSize * 2;
        this.width = size[0];
        this.height = size[1];
        this.active = false;
        this.parent = parent;
        this.txtSize = txtSize;
        this.placeholder = value;
        this.initialize();
    }
    initialize() {
        const fontBody = this._ref.UI.style.nodes.general.textInput.text;
        this.style.container.colour = this._ref.UI.style.nodes.general.textInput.container.colour;
        this.setScale([this.width / 100, this.height / 100]);
        this.setOriginalColor(hexToRgb(this.style.container.colour));
        this.setCanBeMoved(false);
        // add children
        const txt = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.placeholder, fontBody.size, fontBody.font, hexToRgb(fontBody.colour));
        txt.setCanBeMoved(false);
        txt.setBlending(true);
        txt.setCanBeHighlighted(true);
        this.txtObj = txt;
        // txt width
        const txtWidth = txt.txtBuffer.str.cpos[0];
        // centre the text
        txt.setPosition([this.width / 2 - txtWidth / 2, 0]);
        this.handlers.onInputKey = (e) => { this.handleInput(e); };
        txt.handlers.onInputKey = (e) => { this.handleInput(e); };
        // set hierarchy
        if (this.parent)
            this.setParent(this.parent);
        txt.setParent(this);
    }
    handleInput(e) {
        // Get rid of placeholder txt on click
        const currStr = this.txtObj.getText();
        const newStr = changeValueNumeric(this.placeholder, currStr, e.key);
        console.log(newStr);
        if ((typeof newStr !== "string"))
            return;
        this.txtObj.updateText(newStr);
        this.handlers.onValueChange(newStr);
        // center the text
        this.centerText();
    }
    centerText() {
        const txtWidth2 = this.txtObj.txtBuffer.str.cpos[0];
        this.txtObj.setPosition([this.width / 2 - txtWidth2 / 2, 0]);
        // this.txtObj.updateWorldMatrix(this.txtObj.parent.worldMatrix);
    }
    setVisible(isVisible) {
        this.properties.visible = isVisible;
        for (let child of this.children) {
            child.setVisible(isVisible);
        }
    }
}
//# sourceMappingURL=UITextInput.js.map