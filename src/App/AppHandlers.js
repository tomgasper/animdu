import { resetMousePointer, highlightObjUnderCursor } from "./AppHelper.js";

export const handleHandleOnMouseMove = (app) =>
{
    if (app.objectIDtoDrag < 0 && app.objectToDragArrIndx < 0) return;

    const objToMove = app.objsToDraw[app.objectToDragArrIndx].objs[app.objectIDtoDrag];
    if (objToMove.handlers.onMouseMove)
        {

            objToMove.handlers.onMouseMove.call(objToMove, [app.mouseX, app.mouseY]);
        }
}

export const handleUnderMouseCursor = (app, id) =>
{
    if (id.id > 0)
        {
            // substract id by 1 to get correct place of the found object in objsToDraw array 
            const arrIndx = id.arrIndx;
            const pickNdx = id.id - 1;
            const object = app.objsToDraw[arrIndx].objs[pickNdx];

            // save refs to global state
            app.objUnderMouseArrIndx = arrIndx;
            app.objUnderMouseID = pickNdx;

            highlightObjUnderCursor(app.document, object);

            // select object that will be dragged
            if (app.isMouseDown && app.objectIDtoDrag < 0 && app.objectToDragArrIndx < 0)
            {
                app.objectToDragArrIndx = arrIndx;
                app.objectIDtoDrag = pickNdx;
            }

            // on click
            if (app.isMouseClicked === true)
            {
                // Set ID of active object
                app.prevActiveObjID = app.activeObjID;
                app.prevActiveObjArrIndx = app.activeObjArrIndx;

                app.activeObjID = pickNdx;
                app.activeObjArrIndx = arrIndx;

                const activeObj = app.objsToDraw[app.activeObjArrIndx].objs[app.activeObjID];

                if (activeObj && activeObj.handlers.onClick)
                {
                    activeObj.handlers.onClick.call(activeObj);
                }
            }
        }
        else {
            // reset cursor
            resetMousePointer(app.document);
        }
}