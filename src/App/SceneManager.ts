import { RenderableObject } from "../RenderableObject";
import { Composition } from "../Composition/Composition";
import { IDType, RenderQueueType, SceneManagerState } from "../types/globalTypes";

export class SceneManager
{
    // Observers
    private observers = {};

    // Object state
    private objsToDraw : RenderQueueType;

    private activeObjID : number = -1;
    private activeObjArrIndx : number = -1;
    private prevActiveObjID : number;
    private prevActiveObjArrIndx : number;

    private objectIDtoDrag : number = -1;
    private objectToDragArrIndx : number = -1;

    private objUnderMouseId : number = -1;
    private objUnderMouseArrIndx : number =-1;

    // Picking data
    private pickingData : Uint8Array = new Uint8Array(4);

    // Camera state
    private activeComp : Composition;

    constructor(){};

    public subscribe(eventType, callback)
    {
        if (!this.observers[eventType])
        {
            this.observers[eventType] = [];
        }

        this.observers[eventType].push(callback);
    }

    public unsubscribe(eventType, callback) {
        if (!this.observers[eventType]) return;
        this.observers[eventType] = this.observers[eventType].filter(observer => observer !== callback);
    }

    emit(eventType, data)
    {
        if(!this.observers[eventType]) return;
        this.observers[eventType].forEach( cb => cb(data) );
    }

    // Getters
    public getActiveComp() : Composition
    {
        if (!this.activeComp) throw new Error("No assigned comp!");
        return this.activeComp;
    }

    public getActiveObjID()
    {
        return {
                id: this.activeObjID,
                arrIndx: this.activeObjArrIndx
        };
    }

    public getActiveObj() : RenderableObject
    {
        return this.objsToDraw[this.activeObjArrIndx].objs[this.activeObjID];
    }

    public getObjIDToDrag()
    {
        return {
            id: this.objectIDtoDrag,
            arrIndx: this.objectToDragArrIndx
        }
    }

    public getObjUnderMouseID() : IDType
    {
        return {
            id: this.objUnderMouseId,
            arrIndx: this.objUnderMouseArrIndx
        }
    }

    public getPickingData()
    {
        return this.pickingData;
    }

    // Setters
    public setActiveObjID(id: number, arrIndx: number)
    {
        this.activeObjID = id;
        this.activeObjArrIndx = arrIndx;

        this.emit("changeActiveObjID", {type:"newActiveObjID", key:{ id:this.activeObjID, arrIndx: this.activeObjArrIndx} });
    }

    public setObjIDToDrag(id: number, arrIndx: number)
    {
        this.objectIDtoDrag = id;
        this.objectToDragArrIndx = arrIndx;
    }

    public getObjsToDraw()
    {
        return this.objsToDraw;
    }

    public setPrevActiveObjID(id:number, arrIndx:number)
    {
        this.prevActiveObjID = id;
        this.prevActiveObjArrIndx = arrIndx;
    }

    public setActiveComp(activeComp : Composition)
    {
        if (!activeComp) throw new Error("Setting incorrect active composition!");
        this.activeComp = activeComp;
    }

    public setObjUnderMouseID(id: number, arrIndx : number)
    {
        if (id < -1 || arrIndx < -1) throw new Error("Incorrect under mouse object ID");

        this.objUnderMouseId = id;
        this.objUnderMouseArrIndx = arrIndx;
    }

    public getCurrentState() : SceneManagerState
    {
        return {
            objsToDraw: this.objsToDraw,
            activeObjID:
            {
                id: this.activeObjID,
                arrIndx: this.activeObjArrIndx
            },
            objToDragID:
            {
                id: this.objectIDtoDrag,
                arrIndx: this.objectToDragArrIndx
            },
            objUnderMouse:
            {
                id: this.objUnderMouseId,
                arrIndx: this.objUnderMouseArrIndx
            },
            pickingData: this.pickingData,
            activeComp: this.activeComp
        }
    }

    public getObjByID(ID : IDType)
    {
        return this.objsToDraw[ID.arrIndx].objs[ID.id];
    }

    public setActiveCamera(comp : Composition)
    {
        this.activeComp = comp;
    }

    public setObjsToDraw( objsArr : RenderQueueType)
    {
        this.objsToDraw = objsArr;
    }
}