import { getClipSpaceMousePosition } from "../utils.js";
import { SceneManager } from "./SceneManager.js";

export class InputManager
{
    // Keyboard state
    private keyPressed: Set<string>;

    // Mouse State
    private isMouseDown: boolean;
    private isMouseClicked: boolean;
    private isMouseClickedTwice: boolean;
    private mouseX: number;
    private mouseY: number;
    private clickOffset: { x: number; y: number } | undefined;
    private mouseTimer : number;

    // Previouse mouse position
    private prevMouseX : number;
    private prevMouseY : number;

    constructor(glCanvas, sceneManager : SceneManager)
    {
        this.keyPressed = new Set();
        this.isMouseDown = false;
        this.isMouseClicked = false;
        this.isMouseClickedTwice = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.prevMouseX = 0;
        this.prevMouseY = 0;
        this.clickOffset = undefined;

        // Initialize event listeners
        this.initEventListeners(glCanvas, sceneManager);
    }

    private initEventListeners(glCanvas, sceneManager : SceneManager)
    {
        glCanvas.addEventListener("mousemove", (e) => {
            const DELAY = 10;

            const onMouseStop = () => {
                this.prevMouseX = this.mouseX;
                this.prevMouseY = this.mouseY;
            }

            // Need to know when the mouse stops
            // handler for mouse stop event - onMouseStop
            window.clearTimeout(this.mouseTimer);
            this.mouseTimer = window.setTimeout( () => onMouseStop(), DELAY);
    
            this.prevMouseX = this.mouseX;
            this.prevMouseY = this.mouseY;
    
            const rect = glCanvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
         });
    
        glCanvas.addEventListener("keyup", (e) => {
            // Reset active obj info
            /*
                if (e.keyCode === 27)
                {
                    console.log("Reseting active obj!");
    
                    // Reset active obj
                    app.activeObjID = -1;
                    app.activeObjArrIndx = 1;
                }
            */
    
            this.keyPressed.delete(e.key);
        });
    
        glCanvas.addEventListener("keydown", (e) => {
            if (!this.keyPressed.has(e.key)) this.keyPressed.add(e.key);

            const activeObjID = sceneManager.getActiveObjID();
            let activeObj;
    
            // No scene object selected
            if (activeObjID.id < 0 || activeObjID.arrIndx < 0) return;
    
            // Some scene object selected
            if ( activeObj = sceneManager.getActiveObj() && activeObj.handlers.onInputKey )
            {
                let currObj = activeObj.handlers;
                
                currObj.onInputKey.call(currObj,e);
            }
        });
    
         glCanvas.addEventListener("mousedown", (e) => {
            if (app.isMouseDown === false) {
                app.isMouseDown = true;
            }
         });
    
         glCanvas.addEventListener("click", (e) => {
            app.isMouseClicked = true;
         });
    
         glCanvas.addEventListener("dblclick", (e) => {
            app.isMouseClickedTwice = true;
            // app.isMouseClicked = true;
         });
    
         glCanvas.addEventListener("mouseup", (e) => {
            app.isMouseDown = false;
    
            if (app.objectIDtoDrag >= 0 && app.objectToDragArrIndx >= 0)
            {
                const obj = app.objsToDraw[app.objectToDragArrIndx].objs[app.objectIDtoDrag];
                if (obj && obj.handlers.onMouseUp)
                {
                    obj.handlers.onMouseUp.call(obj.handlers, app.objUnderMouseID);
                }
            }
    
            sceneManager.objectIDtoDrag = -1;
            sceneManager.objectToDragArrIndx = -1;
         });
    
         glCanvas.addEventListener("wheel", (e) => {
            // based on greggman implementation:
            // https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-implement-zoom-from-mouse-in-2d-webgl.html
            e.preventDefault();
    
            const viewportOffset = {
                x: app.UI.viewport.position[0],
                y: -app.UI.viewport.position[1]
            };
    
            const [clipX, clipY] = getClipSpaceMousePosition(app,e, viewportOffset);
        
            console.log(clipY);
    
            let compCamera;
            if (clipY > 0) compCamera = app.activeComp.camera;
            else compCamera = app.UI.viewer.camera;
    
            // const compCamera = app.activeComp.camera;
            const projectionMat = getProjectionMat(app.gl);
            let viewMat = m3.inverse(compCamera.matrix);
            let viewProjectionMat = m3.multiply(projectionMat, viewMat);
    
            // position before zooming
            const [preZoomX, preZoomY] = m3.transformPoint(
                m3.inverse(viewProjectionMat), 
                [clipX, clipY]);
    
            console.log(e.deltaY);
            const newZoom = compCamera.zoom * Math.pow(1.85, e.deltaY * -0.01);
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
}