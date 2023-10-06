import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";
import { RenderableObject } from "../RenderableObject.js";
import { getProjectionMat } from "../utils.js";
import { m3, resizeCanvasToDisplaySize } from "../utils.js";

import { setFramebufferAttachmentSizes } from "../pickingFramebuffer.js";

import { Composition } from "../Composition/Composition.js";
import { GeometryObject } from "../GeometryObject.js";

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

    rect.properties.movable = true;
    rect.setPosition([0,0]);
    rect.setOriginalColor([0.5,0.5,0.5,1]);

    return rect;
}

export const modifyParameter = (obj, paramCode, value) =>
{
        switch(paramCode)
        {
            case "position":
                obj.setPosition(value);
                break;

            case "scale":

                obj.setScale(value);
                break;
        } 
    }

export const getPosFromMat = (obj) =>
{
    // accept node instance or matrix
    if ( obj instanceof GeometryObject || obj.length == 9 )
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

        // checking if obj is a scene object or UI object so correct view matrix is applied
        let camera = objToDrag.comp ? app.activeComp.camera.matrix : app.UI.viewer.camera.matrix;

        if (!app.clickOffset)
        {
            let curr_pos = [ objToDrag.worldMatrix[6], objToDrag.worldMatrix[7] ];

            curr_pos = getPosFromMat(m3.multiply(m3.inverse(camera), objToDrag.worldMatrix));
            
            app.clickOffset = [app.mouseX - curr_pos[0], app.mouseY - curr_pos[1]];
            // app.clickOffset = [0,0];
        }

                let parentWorldMat;
                let mouseTranslation = m3.translation(app.mouseX - app.clickOffset[0],app.mouseY - app.clickOffset[1]);
                
                /*
                if (objToDrag.comp)
                {
                    const invViewMat = app.activeComp.camera.matrix;
                    
                } else mous
                */

                mouseTranslation = m3.multiply(camera, mouseTranslation);

                let newPos;

                // Object is a child of some other object
                if (objToDrag.parent)
                {
                    // Position of mouse in different coord space
                    parentWorldMat = m3.identity();
                    m3.copy(parentWorldMat, objToDrag.parent.worldMatrix);

                    // Need to account for canceling scale inheritance
                    const [ parentScaleX, parentScaleY ] = objToDrag.parent.properties.scale;
                    const unScaleMatrix = m3.scaling(1/parentScaleX, 1/parentScaleY);

                    m3.multiplyInPlace(parentWorldMat, parentWorldMat, unScaleMatrix );

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
        if (app.isMouseDown && objToMove.properties.movable === true) return true;
        else return false;
}

export const highlightObjUnderCursor = (document, object) =>
{
    if (object.properties.highlight)
        {
            // change color of the object you're hovering over
            // object.setColor([1,1,0.3,1]);

            // change the mouse pointer style
            document.style.cursor = "pointer";

        } else resetMousePointer(document);
}

export const prepareForFirstPass = (app, framebuffer, mousePos) =>
{
    // Draw the objects to the texture
    app.gl.bindFramebuffer(app.gl.FRAMEBUFFER, framebuffer);

    app.gl.viewport(0,0, app.gl.canvas.width, app.gl.canvas.height);
    app.gl.disable(app.gl.STENCIL_TEST);

    const pixelX = mousePos[0] * app.gl.canvas.width / app.gl.canvas.clientWidth;
    const pixelY = app.gl.canvas.height - mousePos[1] * app.gl.canvas.height / app.gl.canvas.clientHeight - 1;

    app.gl.enable(app.gl.SCISSOR_TEST);
    app.gl.scissor(pixelX, pixelY, 1,1);

    app.gl.stencilMask(0xFF); 
    app.gl.clearColor(0,0,0,0);
    app.gl.clear(app.gl.COLOR_BUFFER_BIT | app.gl.DEPTH_BUFFER_BIT || app.gl.STENCIL_BUFFER_BIT );
    // app.gl.enable(app.gl.DEPTH_TEST);

    app.setBlendingEnabled(false);
};

export const prepareForScndPass = (gl) => 
{
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
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
    app.isMouseClickedTwice = false;
}

export const resizeCanvas = (app) =>
{
    if ( resizeCanvasToDisplaySize(window.originalRes, app.gl.canvas, window.devicePixelRatio))
    {
        console.log("resizing!");
        app.UI.resize();
    
        setFramebufferAttachmentSizes(app.gl, app.depthBuffer, app.gl.canvas.width, app.gl.canvas.height, app.renderTexture);
    }
}

export const addObjToDrawList = (obj, drawList, camera) =>
{
    if (!obj || !(obj.children)) return;
    if (!(obj instanceof RenderableObject)) throw new Error("Incorrect object pushed to draw list!");

    // avoid non-visible objects in draw list
    if (obj.properties.visible)
    {
        drawList.push(obj);
    }

    for (let i = 0; i < obj.children.length; i++)
    {
        addObjToDrawList(obj.children[i],drawList);
    }
}

export const retrieveRenderObjs = (section, camera = undefined) =>
{
    const objsToDraw = [];
    addObjToDrawList(section, objsToDraw, camera = undefined);
    return objsToDraw;
}

const setActiveComp = (appRef, comp) =>
{
    if (comp && comp instanceof Composition) appRef.activeComp = comp;
    else console.log("Trying to set incorrect composition as active!");
}

export const addNewComposition = (appRef, compName, viewport) =>
    {
        const newComp = new Composition(appRef, compName, viewport);
        appRef.comps.push(newComp);
        setActiveComp(appRef, newComp);

        return newComp;
    }