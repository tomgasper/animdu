import { RenderableObject } from "../RenderableObject";

export class SceneManager
{
    private objsToDraw;

    private activeObjID : number;
    private activeObjArrIndx : number;

    private objectIDtoDrag;
    private objectToDragArrIndx;


    public getActiveObjID()
    {
        return {
                id: this.activeObjID,
                arrIndx: this.activeObjArrIndx
        };
    }

    public getActiveObj()
    {
        return this.objsToDraw[this.activeObjArrIndx].objs[this.activeObjID];
    }
}