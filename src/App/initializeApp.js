import { TriangleBuffer } from "../Primitives/TriangleBuffer.js";
import { CircleBuffer } from "../Primitives/CircleBuffer.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

import { getProjectionMat, m3 } from "../utils.js";
import { getPosFromMat } from "./AppHelper.js";

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
    });

    app.document.addEventListener("keydown", (e) => {
        if (app.activeObjID < 0 || app.activeObjArrIndx < 0) return;

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

        const normalizedX = app.mouseX / app.gl.canvas.clientWidth;
        const normalizedY = app.mouseY / app.gl.canvas.clientHeight;

        const clipX = normalizedX * 2 - 1;
        const clipY = normalizedY * -2 + 1;

        const compCamera = app.activeComp.camera;
        const projectionMat = getProjectionMat(app.gl);

        let viewProjectionMat = m3.identity();
        let invVPMat;

        m3.multiplyInPlace(viewProjectionMat, compCamera.matrix, projectionMat);
        invVPMat = m3.inverse(viewProjectionMat);

        let mousePos = m3.translation(clipX, clipY);
        m3.multiplyInPlace(mousePos, invVPMat, mousePos);

        let preZoom = getPosFromMat(mousePos);

        const newZoom = compCamera.zoom * Math.pow(2, e.deltaY * -0.01);
        compCamera.setZoom(newZoom);

        //
        viewProjectionMat = m3.multiply(compCamera.matrix, projectionMat);
        invVPMat = m3.inverse(viewProjectionMat);

        m3.multiplyInPlace(mousePos, invVPMat, mousePos);

        let postZoom = getPosFromMat(mousePos);

        const newCamPosX = compCamera.position[0] + ( preZoom[0] - postZoom[0]);
        const newCamPosY = compCamera.position[1] + ( preZoom[1] - postZoom[1]);

        console.log(preZoom);
        console.log(postZoom);

        console.log(compCamera);

        // compCamera.setPosition( [newCamPosX, newCamPosY]);
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