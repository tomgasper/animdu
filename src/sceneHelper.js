import { RectangleBuffer } from "./Primitives/RectangleBuffer.js";
import { RenderableObject } from "./Primitives/RenderableObject.js";
import { getProjectionMat } from "./utils.js";

export const resetMousePointer = (body) =>
{
    if (body.style.cursor !== "default")
    {
        body.style.cursor = "default";
    }
};

export const createNewRect = (scene, width, height, roundness = 0.05) =>
{
    const projectionMat = getProjectionMat(scene.gl);

    const rectangleBuffer = new RectangleBuffer(scene.gl,scene.programs[0], [width,height], roundness);    
    const rect = new RenderableObject(rectangleBuffer.getInfo(), projectionMat);

    rect.canBeMoved = true;
    rect.setPosition([0,0]);
    rect.setOriginalColor([0.5,0.5,0.5,1]);

    return rect;
}

export const deleteFromToDraw = (arr, obj) =>
{
    arr.forEach((arr_obj, indx, arr_read_only) => {
        if (arr_obj.id == obj.id)
        {
            arr_read_only.splice(indx, 1);

            // only one of the obj with a give id is possible so return after deleting it
            return;
        }
    });
}

export const getPosFromMat = (obj) =>
{
    if (!obj || obj instanceof Node ) throw Error("Wrong input object!");

    return [obj.worldMatrix[6], obj.worldMatrix[7]];
}