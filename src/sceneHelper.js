import { RectangleBuffer } from "./Primitives/RectangleBuffer.js";
import { RenderableObject } from "./Primitives/RenderableObject.js";
import { getProjectionMat } from "./utils.js";

import { m3 } from "./utils.js";

import { renderObject } from "./utils.js";

import { TransformNode } from "./Node/TransformNode.js";

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
    if ( obj instanceof TransformNode || obj.length == 9 )
    {
        let pos;

        if (obj.worldMatrix) pos = [obj.worldMatrix[6], obj.worldMatrix[7]];
        else pos = [obj[6], obj[7]];

        return pos;
    } else throw Error("Wrong input object!");
}

export const moveObjectWithCoursor = (sceneManager) =>
    {
        const objToDrag = sceneManager.objsToDraw[sceneManager.objectIDtoDrag];

        if (!sceneManager.clickOffset)
                {
                    let curr_pos = [ objToDrag.worldMatrix[6], objToDrag.worldMatrix[7] ];
                    
                    sceneManager.clickOffset = [sceneManager.mouseX - curr_pos[0], sceneManager.mouseY - curr_pos[1]];
                }

                let parentWorldMat;
                let mouseTranslation = m3.translation(sceneManager.mouseX - sceneManager.clickOffset[0],sceneManager.mouseY - sceneManager.clickOffset[1]);

                let newPos;

                // Object is a child of some other object
                if (objToDrag.parent)
                {
                    // Position of mouse in different coord space
                    parentWorldMat = objToDrag.parent.worldMatrix;
                    let parentWorldMatInv = m3.inverse(parentWorldMat);
                    
                    let mousePosInDiffCord = m3.multiply(parentWorldMatInv, mouseTranslation);

                    newPos = getPosFromMat(mousePosInDiffCord);
                }
                else 
                {
                    newPos = getPosFromMat(mouseTranslation);
                }

                // handle move restrictions
                if (objToDrag.moveRestriction)
                {
                    // parentWorldMat = objToDrag.parent.worldMatrix;
                    // let parentWorldMatInv = m3.inverse(parentWorldMat);
                    
                    // let mouseTranslation = m3.translation(obj);
                    // let mousePosInDiffCord = m3.multiply(parentWorldMatInv, mouseTranslation);

                    const objGlobalPos = getPosFromMat(objToDrag);
                    const xBound = objToDrag.moveRestriction.x;
                    const yBound = objToDrag.moveRestriction.y;

                    if (newPos[0] < xBound[0] || newPos[0] > xBound[1] ) newPos[0] = objToDrag.properties.position[0];
                    if (newPos[1] < yBound[0] || newPos[1] > yBound[1] ) newPos[1] = objToDrag.properties.position[1];
                }

                objToDrag.setPosition(newPos);

                objToDrag.updateWorldMatrix(parentWorldMat);
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