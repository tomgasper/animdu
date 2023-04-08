import { SceneObject } from "../SceneObject.js";
import { m3, computeTransform } from "../utils.js";

export class TextObject extends SceneObject
{
    // so here we extend the properties parameter
    // with new uniforms
    // basicaly properties = uniforms

    listOfProperties = ["transform", "font_tex", "sdf_tex_size", "sdf_border_size", "hint_amount",
                        "font_color", "subpixel_amount"];

    constructor(renderInfo, textProperties, projectionMat)
    {
        super(renderInfo, projectionMat);
        
        // set necessary text properties on init
        this.setTextProperties(textProperties);
    }

    setTextProperties(inputTextProperties)
    {
        // if the input object is in wrong format throw error
        this.listOfProperties.forEach((property) => {
            if (Object.hasOwn(inputTextProperties, property) === false || typeof property === undefined )
            {
                throw new Error("[TextObject]: Incorrect input object!");
            }
        });

        this.properties = {
            ...this.properties,
            transform: inputTextProperties.transform,
            font_tex : inputTextProperties.font_tex,
            sdf_tex_size : inputTextProperties.sdf_tex_size,
            sdf_border_size : inputTextProperties.sdf_border_size,
            hint_amount: inputTextProperties.hint_amount,
            font_color: inputTextProperties.font_color,
            subpixel_amount: inputTextProperties.subpixel_amount
        };
    }

    // override SceneObject method
    updateTransform()
    {
        const flip = [
            1,0,0,
            0,-1,0,
            0,0,1
        ];

        let newTransform = computeTransform(this.properties.position,this.properties.rotation,this.properties.scale, this.properties.origin);
        newTransform = m3.multiply(newTransform, flip);
        this.properties.transform = m3.multiply(this.properties.projection, newTransform);
    }
}