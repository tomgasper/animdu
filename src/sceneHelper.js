import { RectangleBuffer } from "./Primitives/RectangleBuffer.js";
import { RenderableObject } from "./Primitives/RenderableObject.js";
import { getProjectionMat } from "./utils.js";

import { m3 } from "./utils.js";

import { renderObject } from "./utils.js";

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

export const moveObjectWithCoursor = (sceneManager) =>
    {
        if (!sceneManager.clickOffset)
                {
                    const obj = sceneManager.objsToDraw[sceneManager.objectIDtoDrag];
                    let curr_pos = [ obj.worldMatrix[6], obj.worldMatrix[7] ];
                    
                    sceneManager.clickOffset = [sceneManager.mouseX - curr_pos[0], sceneManager.mouseY - curr_pos[1]];
                }

                let parentWorldMat;
                let mouseTranslation = m3.translation(sceneManager.mouseX - sceneManager.clickOffset[0],sceneManager.mouseY - sceneManager.clickOffset[1]);

                // Object is a child of some other object
                if (sceneManager.objsToDraw[sceneManager.objectIDtoDrag].parent)
                {
                    parentWorldMat = sceneManager.objsToDraw[sceneManager.objectIDtoDrag].parent.worldMatrix;
                    let parentWorldMatInv = m3.inverse(parentWorldMat);
                    
                    let newPos = m3.multiply(parentWorldMatInv, mouseTranslation);

                    sceneManager.objsToDraw[sceneManager.objectIDtoDrag].setPosition([newPos[6],newPos[7]]);
                }
                else 
                {
                    sceneManager.objsToDraw[sceneManager.objectIDtoDrag].setPosition([mouseTranslation[6],mouseTranslation[7]]);
                }

                sceneManager.objsToDraw[sceneManager.objectIDtoDrag].updateWorldMatrix(parentWorldMat);
    }

    export const canMoveObj = (sceneManager) =>
    {
        if (sceneManager.isMouseDown && sceneManager.objectIDtoDrag >= 0 && sceneManager.objsToDraw[sceneManager.objectIDtoDrag].canBeMoved === true) return true;
        else return false;
}

export const drawObjects = (scene, objsToDraw, programInfo = undefined) =>
    {
        // to do
        let program;
        const projection = m3.projection(scene.gl.canvas.clientWidth, scene.gl.canvas.clientHeight);

        if (typeof programInfo !== "undefined" ) // Use object's shader when shader hasn't been specified
        {
            program = programInfo;

            scene.gl.useProgram(program.program);

            // set projection based on canvas dimensions
            objsToDraw.forEach((obj, i) => {
                // (!) Notice that we are setting id offset by 1
                const ii = i +1 ;

                // if object is pickable then assign it a u_id
                const u_id = [
                        ((ii >>  0) & 0xFF) / 0xFF,
                        ((ii >>  8) & 0xFF) / 0xFF,
                        ((ii >> 16) & 0xFF) / 0xFF,
                        ((ii >> 24) & 0xFF) / 0xFF
                    ];

                obj.setID(u_id);

                // here basically you can modify tings
                obj.setProjection(projection);

                renderObject(scene.gl, obj, program);

                // Reset color
                obj.setColor(obj.properties.originalColor);
        })} else {
            objsToDraw.forEach((obj, ii) => {
                let objProgram = obj.renderInfo.programInfo;

                // Switch shader if the cached one doesn't work
                if (objProgram !== program)
                { 
                    scene.gl.useProgram(objProgram.program);
                    program = objProgram;
                }

                if (obj.properties.blending === true && !scene.gl.isEnabled(scene.gl.BLEND) )
                {
                    scene.gl.enable(scene.gl.BLEND);
                }

                obj.setProjection(projection);

                renderObject(scene.gl, obj, program);

                // Disable blending
                if (scene.gl.isEnabled(scene.gl.BLEND) )
                {
                    scene.gl.disable(scene.gl.BLEND);
                }
        })}
    }

    export const highlightObjUnderCursor = (document, object) =>
    {
        if (object.properties.highlight)
            {
                // change color of the object you're hovering over
                object.setColor([1,1,0.3,1]);

                // change the mouse pointer style
                document.style.cursor = "pointer";

            } else resetMousePointer(document);
    }