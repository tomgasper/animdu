import { SceneManager } from './SceneManager';
import { InputManagerState } from '../types/globalTypes';

export class InputManager
{
    // Keyboard state
    private isKeyPressed : boolean;
    private keyPressed: Set<string>;
    private prevKeyPressed: Set<string>;

    // Mouse State
    private isMouseDown: boolean;
    private isMouseUp: boolean;
    private isMouseClicked: boolean;
    private isMouseClickedTwice: boolean;
    private isMouseWheel : boolean;
    private wheelYDelta : number;
    private mouseX: number;
    private mouseY: number;
    private clickOffsetRef: { x: number; y: number } | undefined;
    private mouseTimer : number;

    // Previouse mouse position
    private prevMouseX : number;
    private prevMouseY : number;

    //
    private mouseClientX : number;
    private mouseClientY : number;

    constructor(glCanvas, htmlDocument)
    {
        this.keyPressed = new Set();
        this.isMouseDown = false;
        this.isMouseClicked = false;
        this.isMouseClickedTwice = false;
        this.isMouseWheel = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.prevMouseX = 0;
        this.prevMouseY = 0;
        this.clickOffsetRef = undefined;

        // Initialize event listeners
        this.initEventListeners(glCanvas, htmlDocument);
    }

    private initEventListeners(glCanvas, htmlDocument )
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

            this.mouseClientX = e.clientX;
            this.mouseClientY = e.clientY;
         });
    
        window.addEventListener("keyup", (e) => {
            this.prevKeyPressed = new Set(this.keyPressed);
            this.keyPressed.delete(e.key);
        });
    
        window.addEventListener("keydown", (e) => {
            // Should be in eventhandler function
            this.isKeyPressed = true;

            this.prevKeyPressed = new Set(this.keyPressed);
            if (!this.keyPressed.has(e.key)) this.addKeyPressed(e.key);
        });
    
         glCanvas.addEventListener("mousedown", (e) => {
            if (this.isMouseDown === false) {
                this.isMouseDown = true;
            }
         });
    
         glCanvas.addEventListener("click", (e) => {
            this.isMouseClicked = true;
         });
    
         glCanvas.addEventListener("dblclick", (e) => {
            this.isMouseClickedTwice = true;
         });
    
         glCanvas.addEventListener("mouseup", () => {
            // Should be in eventhandler function
            this.isMouseDown = false;
            this.isMouseUp = true;
         });
    
         glCanvas.addEventListener("wheel", (e) => {
            // based on greggman implementation:
            // https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-implement-zoom-from-mouse-in-2d-webgl.html
            e.preventDefault();

            this.isMouseWheel = true;
            this.wheelYDelta = e.deltaY;
        });
        }

        // Getters
        public getKeyPressed(): Set<string> {
            return new Set(this.keyPressed); // Clone to prevent external modifications
        }

        public getIsMouseDown(): boolean {
            return this.isMouseDown;
        }
        
        public getIsMouseUp(): boolean {
            return this.isMouseUp;
        }

        public getIsMouseClicked(): boolean {
            return this.isMouseClicked;
        }

        public getIsMouseClickedTwice(): boolean {
            return this.isMouseClickedTwice;
        }

        public getIsMouseWheel(): boolean {
            return this.isMouseWheel;
        }

        public getWheelYDelta(): number {
            return this.wheelYDelta;
        }

        public getMouseX(): number {
            return this.mouseX;
        }

        public getMouseY(): number {
            return this.mouseY;
        }

        public getClickOffset(): { x: number; y: number } | undefined {
            return this.clickOffsetRef;
        }

        public getMouseTimer(): number {
            return this.mouseTimer;
        }

        public getMousePos()
        {
            return {
                x: this.mouseX,
                y: this.mouseY
            }
        }

        public getPrevMousePos()
        {
            return {
                x: this.prevMouseX,
                y: this.prevMouseY
            }
        }

        public getMouseClient()
        {
            return {
                x: this.mouseClientX,
                y: this.mouseClientY
            }
        }

        public getCurrentState(): InputManagerState {
            return {
                isKeyPressed : this.isKeyPressed,
                prevKeyPressed: this.prevKeyPressed,
                keyPressed: new Set(this.keyPressed), // Clone to prevent external modifications
                isMouseDown: this.isMouseDown,
                isMouseClicked: this.isMouseClicked,
                isMouseClickedTwice: this.isMouseClickedTwice,
                isMouseWheel: this.isMouseWheel,
                wheelYDelta: this.wheelYDelta,
                mouseX: this.mouseX,
                mouseY: this.mouseY,
                clickOffsetRef: this.clickOffsetRef ? this.clickOffsetRef : undefined, // Not cloning here, using ref
                prevMouseX: this.prevMouseX,
                prevMouseY: this.prevMouseY
            };
        }

        public setClickOffset(x: number | undefined, y:number | undefined)
        {
            // Reset clickoffset
            if (!x || !y)
            {
                this.clickOffsetRef = undefined;
                return;
            }

            if (!this.clickOffsetRef)
            {
                this.clickOffsetRef = {
                    x: 0,
                    y: 0
                }
            }

            this.clickOffsetRef.x = x;
            this.clickOffsetRef.y = y;
        }

        // Setters
        public addKeyPressed(key: string): void {
            this.keyPressed.add(key);
        }

        public removeKeyPressed(key: string): void {
            this.keyPressed.delete(key);
        }

        public setIsMouseDown(isDown: boolean): void {
            this.isMouseDown = isDown;
        }

        public setIsMouseUp(isUp : boolean): void {
            this.isMouseUp = isUp;
        }

        public setIsMouseClicked(isClicked: boolean): void {
            this.isMouseClicked = isClicked;
        }

        public setIsMouseClickedTwice(isClickedTwice: boolean): void {
            this.isMouseClickedTwice = isClickedTwice;
        }

        public setIsMouseWheel(isWheel: boolean): void {
            this.isMouseWheel = isWheel;
        }

        public setWheelYDelta(delta: number): void {
            this.wheelYDelta = delta;
        }

        public setMousePos(x: number, y: number): void {
            this.mouseX = x;
            this.mouseY = y;
        }

        public setPrevMousePos(x: number, y: number): void {
            this.prevMouseX = x;
            this.prevMouseY = y;
        }

        public setClickOffsetRef(offset: { x: number; y: number } | undefined): void {
            this.clickOffsetRef = offset;
        }


        public setMouseTimer(timer: number): void {
            this.mouseTimer = timer;
        }

        public getIsKeyPressed() : boolean {
            return this.isKeyPressed;
        }

        public setIsKeyPressed(isKeyPressed : boolean) {
            this.isKeyPressed = isKeyPressed;
        }
}