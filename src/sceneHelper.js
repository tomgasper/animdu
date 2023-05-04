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