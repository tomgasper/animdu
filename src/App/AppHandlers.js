import { getIdFromCurrentPixel } from '../pickingFramebuffer';
import { resetMousePointer, highlightObjUnderCursor } from './AppHelper';
import { canMoveObj, moveObjectWithCoursor } from './AppHelper';

export const handleEvents = (app) =>
{
    let movingCamera = false;

        // moving view camera for viewport
        if (app.inputState.keyPressed.indexOf(" ") !== -1)
        {
            movingCamera = true;
            app.document.style.cursor = "grab";

            if (app.isMouseDown)
            {
                const dist_x = app.mouseX - app.prevMouseX;
                const dist_y = app.mouseY - app.prevMouseY;

                let cam;
                if (app.mouseY < app.gl.canvas.clientHeight/2) cam = app.activeComp.camera;
                else cam = app.UI.viewer.camera;

                cam.setPosition([cam.position[0] - ( dist_x * 1/cam.zoom ), cam.position[1] - ( dist_y * 1/cam.zoom) ]);
            }
        }

        if (movingCamera) return;

        // Look up id of the object under mouse cursor
        const underMouseObjId = getIdFromCurrentPixel(app, app.mouseX, app.mouseY);
        
        handleUnderMouseCursor(app, underMouseObjId);

        // Handle move comp object
        if ( canMoveObj(app) )
        {
            moveObjectWithCoursor(app);
        }

        // Handle UI Node handles events
        handleHandleOnMouseMove(app);
}

const handleHandleOnMouseMove = (app) =>
{
    if (app.objectIDtoDrag < 0 && app.objectToDragArrIndx < 0) return;

    const objToMove = app.objsToDraw[app.objectToDragArrIndx].objs[app.objectIDtoDrag];
    if (objToMove.handlers.onMouseMove)
        {

            objToMove.handlers.onMouseMove.call(objToMove, [app.mouseX, app.mouseY]);
        }
}

const handleUnderMouseCursor = (app, id) =>
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

                // on double click
                if (app.isMouseClickedTwice === true)
                {
                    if (activeObj && activeObj.handlers.onDblClick)
                    {
                        activeObj.handlers.onDblClick.call(activeObj);
                    }
                }
            }
        }
        else {
            // reset cursor
            resetMousePointer(app.document);
        }
}