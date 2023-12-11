import { getIdFromCurrentPixel } from "../pickingFramebuffer.js";
import { resetMousePointer, highlightObjUnderCursor } from "./AppHelper.js";
import { canMoveObj, moveObjectWithCoursor } from "./AppHelper.js";

import { m3,getClipSpaceMousePosition,getProjectionMat } from "../utils.js";

import { IDType } from "../types/globalTypes.js";

import { Camera } from "../Composition/Camera.js";
import { SceneManager } from "./SceneManager.js";
import { InputManager } from "./InputManager.js";

import { Composition } from "../Composition/Composition.js";


export const handleEvents = (
    glRef,
    documentStyleRef,
    UI,
    inputManager : InputManager,
    sceneManager : SceneManager) =>
{
    const inputEntryState = inputManager.getCurrentState();
    const activeComp : Composition  = sceneManager.getActiveComp();

    // Moving app view camera when holding space
    // Cancel other events if true
    if ( moveViewCamera(inputEntryState, documentStyleRef, activeComp.getCamera(), UI.viewer.camera) ) return;

    // Handle mouse wheel
    const isMouseWheelAction = inputManager.getIsMouseWheel();
    if (isMouseWheelAction)
    {
        handleMouseWheel(glRef, inputManager, sceneManager, UI);
    }

    // Look up id of the object under mouse cursor
    const underMouseObjId = getIdFromCurrentPixel(  glRef,
                                                    sceneManager.getPickingData(),
                                                    inputEntryState.mouseX,
                                                    inputEntryState.mouseY);
    
    handleUnderMouseCursor( documentStyleRef,
                            inputManager,
                            sceneManager,
                            underMouseObjId);

    // Handle move comp object
    if ( canMoveObj(inputManager, sceneManager) )
    {
        moveObjectWithCoursor(inputManager, sceneManager, UI);
    }

    // Handle UI Node handles events
    handleHandleOnMouseMove( inputManager, sceneManager);

    // Reset inputs
    resetInputs(inputManager, sceneManager);
}

const resetInputs = (inputManager : InputManager, sceneManager : SceneManager) =>
{
    inputManager.setIsMouseWheel(false);
    inputManager.setIsMouseClicked(false);
    inputManager.setIsMouseClickedTwice(false);
}

const moveViewCamera = (inputState, documentStyleRef, activeCamera : Camera, UICamera : Camera) =>
{
    if (inputState.keyPressed.indexOf(" ") !== -1)
    {
        // movingCamera = true;
        // app.document.style.cursor = "grab";
        documentStyleRef.cursor = "grab";

        if (inputState.isMouseDown == true)
        {
            const dist_x = inputState.mouseX - inputState.prevMouseX;
            const dist_y = inputState.mouseY - inputState.prevMouseY;

            let cam : Camera;
            if (inputState.mouseY < inputState.gl.canvas.clientHeight/2) cam = activeCamera;
            else cam = UICamera;

            cam.setPosition([cam.position[0] - ( dist_x * 1/cam.zoom ), cam.position[1] - ( dist_y * 1/cam.zoom) ]);
        }

        return true;
    }

    return false;
}

const handleHandleOnMouseMove = (inputManager : InputManager,
                                sceneManager : SceneManager,
                                    ) =>
{
    const objIDToDrag = sceneManager.getObjIDToDrag();
    if (objIDToDrag.id < 0 && objIDToDrag.arrIndx < 0) return;

    const objToMove = sceneManager.getActiveObj();
    const mousePos = inputManager.getMousePos();
    if (objToMove.handlers.onMouseMove)
        {

            objToMove.handlers.onMouseMove.call(objToMove, [mousePos.x, mousePos.y]);
        }
}

const handleUnderMouseCursor = (documentStyleRef,
                                    inputManager : InputManager,
                                    sceneManager : SceneManager,
                                    underMouseObjID : IDType) =>
{
    if (underMouseObjID.id > 0)
        {
            // substract id by 1 to get correct place of the found object in objsToDraw array 
            const arrIndx = underMouseObjID.arrIndx;
            const pickNdx = underMouseObjID.id - 1;
            const object = sceneManager.getObjByID({id: pickNdx, arrIndx: arrIndx});

            // Update state
            sceneManager.setObjUnderMouseID(pickNdx, arrIndx);

            highlightObjUnderCursor(documentStyleRef, object);

            // Read state
            const isMouseDown = inputManager.getIsMouseDown();
            const objIdToDrag = sceneManager.getObjIDToDrag();

            // select object that will be dragged
            if (isMouseDown && objIdToDrag.id < 0 && objIdToDrag.arrIndx < 0)
            {
                sceneManager.setObjIDToDrag(pickNdx, arrIndx);
            }

            const isMouseClicked = inputManager.getIsMouseClicked();

            // On click
            if (isMouseClicked === true)
            {
                const activeObjId = sceneManager.getActiveObjID();
                // Set ID of active object
                sceneManager.setPrevActiveObjID(activeObjId.id, activeObjId.arrIndx);
                sceneManager.setActiveObjID(pickNdx, arrIndx);

                const activeObj = sceneManager.getActiveObj();

                if (activeObj && activeObj.handlers.onClick)
                {
                    activeObj.handlers.onClick.call(activeObj);
                }

                const isMouseClicked = inputManager.getIsMouseClickedTwice();
                // On double click
                if (isMouseClicked === true)
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
            resetMousePointer(documentStyleRef);
        }
}

const handleMouseWheel = (glRef, inputManager: InputManager, sceneManager : SceneManager, UI) =>
{
    // based on greggman implementation:
            // https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-implement-zoom-from-mouse-in-2d-webgl.html

            const deltaY = inputManager.getWheelYDelta();

            const viewportOffset = {
                x: UI.viewport.position[0],
                y: -UI.viewport.position[1]
            };
    
            const [clipX, clipY] = getClipSpaceMousePosition(glRef.canvas,
                                                            inputManager.getMouseClient(),
                                                            viewportOffset);
    
            let compCamera : Camera;
            if (clipY > 0) compCamera = sceneManager.getActiveComp().camera;
            else compCamera = UI.viewer.camera;

            const projectionMat = getProjectionMat(glRef);
            let viewMat = m3.inverse(compCamera.matrix);
            let viewProjectionMat = m3.multiply(projectionMat, viewMat);
    
            // Position before zooming
            const [preZoomX, preZoomY] = m3.transformPoint(
                m3.inverse(viewProjectionMat), 
                [clipX, clipY]);
    
            const newZoom = compCamera.zoom * Math.pow(1.85, deltaY * -0.01);
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
}