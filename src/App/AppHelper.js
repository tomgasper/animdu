import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";
import { RenderableObject } from "../RenderableObject.js";
import { getProjectionMat } from "../utils.js";

import { m3, resizeCanvasToDisplaySize } from "../utils.js";

import { renderObject } from "../utils.js";

import { TransformNode } from "../Node/TransformNode.js";

import { setFramebufferAttachmentSizes } from "../pickingFramebuffer.js";

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

export const moveObjectWithCoursor = (app) =>
    {
        const objToDrag = app.objsToDraw[app.objectToDragArrIndx].objs[app.objectIDtoDrag];

        if (!app.clickOffset)
                {
                    let curr_pos = [ objToDrag.worldMatrix[6], objToDrag.worldMatrix[7] ];
                    
                    app.clickOffset = [app.mouseX - curr_pos[0], app.mouseY - curr_pos[1]];
                }

                let parentWorldMat;
                let mouseTranslation = m3.translation(app.mouseX - app.clickOffset[0],app.mouseY - app.clickOffset[1]);

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

    export const canMoveObj = (app) =>
    {
        if (app.objectIDtoDrag < 0 || app.objectToDragArrIndx < 0) return false;

        const objToMove = app.objsToDraw[app.objectToDragArrIndx].objs[app.objectIDtoDrag];
        if (app.isMouseDown && objToMove.canBeMoved === true) return true;
        else return false;
}

export const drawObjects = (scene, objsToDraw, objsArrIndx, programInfo = undefined) =>
    {
        // to do
        let program;
        const projection = m3.projection(scene.gl.canvas.clientWidth, scene.gl.canvas.clientHeight);

        if (typeof programInfo !== "undefined" ) // this is drawing for picking pass, with specified shader
        {
            program = programInfo;
            scene.gl.useProgram(program.program);

            // set projection based on canvas dimensions
            objsToDraw.forEach((obj, i) => {
                if (!(obj instanceof RenderableObject)) throw Error("Incorrect object in draw loop!" + obj);
                // (!) Notice that we are setting id offset by 1
                const ii = i +1 ;

                // if object is pickable then assign it a u_id
                const u_id = [
                        ((objsArrIndx >>  0) & 0xFF) / 0xFF,
                        ((ii >> 0 ) & 0xFF) / 0xFF,
                        ((ii >> 8 ) & 0xFF) / 0xFF,
                        ((ii >> 16) & 0xFF) / 0xFF
                    ];

                obj.setID(u_id);

                // here basically you can modify tings
                obj.setProjection(projection);

                renderObject(scene.gl, obj, program);

                // Reset color
                obj.setColor(obj.properties.originalColor);
        })} else {  // Use object's shader when shader hasn't been specified
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

                //obj.setProjection(projection);

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

export const prepareForFirstPass = (gl, framebuffer) =>
{
    // Draw the objects to the texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.disable(gl.BLEND);
};

export const prepareForScndPass = (gl) => 
{
    gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
};

export const resetMouseClick = (app) =>
{
    // reset click offset when mouse is no longer down
    if (!app.isMouseDown && app.clickOffset)
    {
        app.clickOffset = undefined;
    }
    
    app.isMouseClicked = false;
}

export const resizeCanvas = (app) =>
{
    if ( resizeCanvasToDisplaySize(window.originalRes, app.gl.canvas, window.devicePixelRatio))
    {
        setFramebufferAttachmentSizes(app.gl, app.depthBuffer, app.gl.canvas.width, app.gl.canvas.height, app.renderTexture);
    }
}
