var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TextObject_listOfOwnProperties;
import { m3, computeTransform } from "../utils.js";
import { RenderableObject } from "../RenderableObject.js";
export class TextObject extends RenderableObject {
    constructor(buffer, textProperties) {
        super(buffer);
        // so here we extend the properties parameter
        // with new uniforms
        // basicaly properties = uniforms
        this.txtBuffer = {};
        _TextObject_listOfOwnProperties.set(this, ["transform", "font_tex", "sdf_tex_size", "sdf_border_size", "hint_amount",
            "font_color", "subpixel_amount"]);
        // set necessary text properties on init
        this.setTextProperties(textProperties);
        this.txtBuffer = buffer;
    }
    setTextProperties(inputTextProperties) {
        // if the input object is in wrong format throw error
        __classPrivateFieldGet(this, _TextObject_listOfOwnProperties, "f").forEach((property) => {
            if (Object.hasOwn(inputTextProperties, property) === false || typeof property === undefined) {
                throw new Error("[TextObject]: Incorrect input object!");
            }
        });
        this.properties = Object.assign(Object.assign({}, this.properties), { txt_string: inputTextProperties.txt_string, transform: inputTextProperties.transform, font_tex: inputTextProperties.font_tex, sdf_tex_size: inputTextProperties.sdf_tex_size, sdf_border_size: inputTextProperties.sdf_border_size, hint_amount: inputTextProperties.hint_amount, font_color: inputTextProperties.font_color, subpixel_amount: inputTextProperties.subpixel_amount });
    }
    updateText(txt, txtSize = 10) {
        if (typeof txt == "string") {
            if (txt.length === 0)
                txt = " ";
            this.properties.txt_string = txt;
            this.txtBuffer.updateTextBufferData(this.properties.txt_string, txtSize);
        }
        else
            throw Error("Incorrect input string");
    }
    // override SceneObject method
    updateTransform() {
        let newTransform = computeTransform(this.properties.position, this.properties.rotation, this.properties.scale, this.properties.origin);
        this.localMatrix = newTransform;
    }
    getText() {
        return this.properties.txt_string;
    }
    setColor(color) {
        this.properties.font_color = color;
    }
}
_TextObject_listOfOwnProperties = new WeakMap();
//# sourceMappingURL=TextObject.js.map