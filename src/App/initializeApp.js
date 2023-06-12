import { TriangleBuffer } from "../Primitives/TriangleBuffer.js";
import { CircleBuffer } from "../Primitives/CircleBuffer.js";
import { RectangleBuffer } from "../Primitives/RectangleBuffer.js";

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
        if (app.activeObjID >= 0 && app.objsToDraw[app.activeObjID].handlers.onInputKey)
        {
            let currObj = app.objsToDraw[app.activeObjID].handlers;
            
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

        if (app.objectIDtoDrag >= 0 && app.objsToDraw[app.objectIDtoDrag].handlers.onMouseUp)
        {
            let currObj = app.objsToDraw[app.objectIDtoDrag].handlers;
            currObj.onMouseUp.call(currObj, app.objUnderMouseID);
        }

        app.objectIDtoDrag = -1;
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