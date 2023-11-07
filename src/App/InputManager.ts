// To do
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

    // Previouse mouse position
    private prevMouseX : number;
    private prevMouseY : number;

    constructor()
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
        this.initEventListeners();
    }

    initEventListeners()
    {

    }

    /*
    // Getters
    getActiveObj() : {}
    {
        return { arrIndx: this.activeObj.arrIndx,
                 id: this.activeObj.id };
    }

    // Setters
    setActiveObj(arrIndx: number, id : number)
    {
        if (!arrIndx || !id || arrIndx < -1 || id < -1) throw new Error("Setting incorrect activeObj arrIndx/id");
        this.prevActiveObj.arrIndx = this.activeObj.arrIndx;
        this.prevActiveObj.id = this.activeObj.id;

        this.activeObj.arrIndx = arrIndx;
        this.activeObj.id = id;
    }
    */
}