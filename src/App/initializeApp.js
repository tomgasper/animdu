import { TriangleBuffer } from "../Primitives/TriangleBuffer.js";
import { CircleBuffer } from "../Primitives/CircleBuffer.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { getProjectionMat, m3 } from "../utils.js";
import { getPosFromMat } from "./AppHelper.js";

import { getClipSpaceMousePosition } from "../utils.js";

export const initalizeApp = (app) =>
{
    setUpPrimitveBuffers(app, app.programs[0]);
}

export const initInputListeners = (app) => 
{
    // LISTENERS FOR USER INPUT
    app.gl.canvas.addEventListener("mousemove", (e) => {
        const rect = app.canvas.getBoundingClientRect();
        app.mouseX = e.clientX - rect.left;
        app.mouseY = e.clientY - rect.top;
     });

    app.document.addEventListener("keyup", (e) => {
        // Reset active obj info
            if (e.keyCode === 27)
            {
                console.log("Reseting active obj!");

                // Reset active obj
                app.activeObjID = -1;
                app.activeObjArrIndx = 1;
            }
    });

    app.document.addEventListener("keydown", (e) => {
        // No scene object selected
        if (app.activeObjID < 0 || app.activeObjArrIndx < 0)
        {
            if (e.keyCode === 32)
            {
                // To do later
                // Set camera
                
                // First set spacedown state
                // Second go to mousedown handler
                // Handle movement when space down
                const compCamera = app.activeComp.camera;
                compCamera.setPosition( [0, 0]);
            }

            return;
        }

        // Some scene object selected
        if ( app.objsToDraw[app.activeObjArrIndx].objs[app.activeObjID].handlers.onInputKey)
        {
            let currObj = app.objsToDraw[app.activeObjArrIndx].objs[app.activeObjID].handlers;
            
            currObj.onInputKey.call(currObj,e);
        }
    });

     app.gl.canvas.addEventListener("mousedown", (e) => {
        if (app.isMouseDown === false) {
            app.isMouseDown = true;
        }
     });

     app.gl.canvas.addEventListener("click", (e) => {
        app.isMouseClicked = true;
     });

     app.gl.canvas.addEventListener("mouseup", (e) => {
        app.isMouseDown = false;

        if (app.objectIDtoDrag >= 0 && app.objectToDragArrIndx >= 0)
        {
            const obj = app.objsToDraw[app.objectToDragArrIndx].objs[app.objectIDtoDrag];
            if (obj && obj.handlers.onMouseUp)
            {
                obj.handlers.onMouseUp.call(obj.handlers, app.objUnderMouseID);
            }
        }

        app.objectIDtoDrag = -1;
        app.objectToDragArrIndx = -1;
     });

     app.gl.canvas.addEventListener("wheel", (e) => {
        // based on greggman implementation:
        // https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-implement-zoom-from-mouse-in-2d-webgl.html
        e.preventDefault();

        const viewportOffset = {
            x: app.UI.viewport.position[0],
            y: -app.UI.viewport.position[1]
        };

        const [clipX, clipY] = getClipSpaceMousePosition(app,e, viewportOffset);

        const compCamera = app.activeComp.camera;
        const projectionMat = getProjectionMat(app.gl);
        let viewMat = m3.inverse(compCamera.matrix);
        let viewProjectionMat = m3.multiply(projectionMat, viewMat);

        // position before zooming
        const [preZoomX, preZoomY] = m3.transformPoint(
            m3.inverse(viewProjectionMat), 
            [clipX, clipY]);

        const newZoom = compCamera.zoom * Math.pow(2, e.deltaY * -0.01);
        compCamera.setZoom(Math.max(0.02, Math.min(100,newZoom) ));

        viewMat = m3.inverse(compCamera.matrix);
        viewProjectionMat = m3.multiply(projectionMat, viewMat);

        // position after zooming
        const [postZoomX, postZoomY] = m3.transformPoint(
            m3.inverse(viewProjectionMat), 
            [clipX, clipY]);

        // camera needs to be moved the difference of before and after

        const newCamPosX = compCamera.position[0] + ( preZoomX - postZoomX );
        const newCamPosY = compCamera.position[1] + ( preZoomY - postZoomY );

        compCamera.setPosition( [newCamPosX, newCamPosY]);
     });
}

const setUpPrimitveBuffers = (app, program) =>
{
    // Describe buffers for primitive shape
    const triangleBuffer = new TriangleBuffer(app.gl, program);
    const circleBuffer = new CircleBuffer(app.gl,program, 50, 8);
    const rectangleBuffer = new RectangleBuffer(app.gl,program);    

    app.primitiveBuffers = {
        rectangle: rectangleBuffer.getInfo(),
        circle: circleBuffer.getInfo(),
        triangle: triangleBuffer.getInfo()
    };
}