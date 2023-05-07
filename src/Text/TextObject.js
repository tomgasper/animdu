import { m3, computeTransform } from "../utils.js";

import { RenderableObject } from "../Primitives/RenderableObject.js";

export class TextObject extends RenderableObject
{
    // so here we extend the properties parameter
    // with new uniforms
    // basicaly properties = uniforms

    txtBuffer = {};

    #listOfOwnProperties = ["transform", "font_tex", "sdf_tex_size", "sdf_border_size", "hint_amount",
                        "font_color", "subpixel_amount"];


    constructor(renderInfo, txtBuffer, textProperties, projectionMat)
    {
        super(renderInfo, projectionMat);
        
        // set necessary text properties on init
        this.setTextProperties(textProperties);

        this.txtBuffer = txtBuffer;
    }

    setTextProperties(inputTextProperties)
    {
        // if the input object is in wrong format throw error
        this.#listOfOwnProperties.forEach((property) => {
            if (Object.hasOwn(inputTextProperties, property) === false || typeof property === undefined )
            {
                throw new Error("[TextObject]: Incorrect input object!");
            }
        });

        this.properties = {
            ...this.properties,
            txt_string: inputTextProperties.txt_string,
            transform: inputTextProperties.transform,
            font_tex : inputTextProperties.font_tex,
            sdf_tex_size : inputTextProperties.sdf_tex_size,
            sdf_border_size : inputTextProperties.sdf_border_size,
            hint_amount: inputTextProperties.hint_amount,
            font_color: inputTextProperties.font_color,
            subpixel_amount: inputTextProperties.subpixel_amount
        };
    }

    updateText(txt)
    {
        if (txt && typeof txt == "string")
        {
            this.properties.txt_string = txt;
        }
        else throw Error("Incorrect input string");
    }

    setColor(color)
    {
        this.properties.font_color = color;
    }

    // override SceneObject method
    updateTransform()
    {
        // const flip = [
        //     1,0,0,
        //     0,-1,0,
        //     0,0,1
        // ];

        let newTransform = computeTransform(this.properties.position,this.properties.rotation,this.properties.scale, this.properties.origin);

        // newTransform = m3.multiply(newTransform, flip);
        
        this.localMatrix = newTransform;
    }
}