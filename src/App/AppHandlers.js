import { resetMousePointer, highlightObjUnderCursor } from "./AppHelper.js";

export const handleHandleOnMouseMove = (app) =>
{
    if (app.objectIDtoDrag >= 0 && app.objsToDraw[app.objectIDtoDrag].handlers.onMouseMove)
        {
            let currObj = app.objsToDraw[app.objectIDtoDrag].handlers;
            currObj.onMouseMove.call(currObj, [app.mouseX, app.mouseY]);
        }
}

export const handleUnderMouseCursor = (app, id) =>
{
    if (id > 0)
        {
            // substract id by 1 to get correct place of the found object in objsToDraw array 
            const pickNdx = id - 1;
            const object = app.objsToDraw[pickNdx];
            app.objUnderMouseID = pickNdx;

            highlightObjUnderCursor(app.document, object);

            // select object that will be dragged
            if (app.isMouseDown && app.objectIDtoDrag < 0)
            {
                app.objectIDtoDrag = pickNdx;
            }

            // on click
            if (app.isMouseClicked === true)
            {
                // Set ID of active object
                app.prevActiveObjID = app.activeObjID;
                app.activeObjID = pickNdx;

                if (app.objsToDraw[app.activeObjID] && app.objsToDraw[app.activeObjID].handlers.onClick)
                {
                    app.objsToDraw[app.activeObjID].handlers.onClick.call(app.objsToDraw[app.activeObjID]);
                }
            }
        }
        else {
            // reset cursor
            resetMousePointer(app.document);
        }
}