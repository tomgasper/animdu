import { SceneObject } from "../SceneObject.js";

export class UIObject extends SceneObject{
    constructor(renderInfo, projectionMat)
    {
        super(renderInfo, projectionMat)
        
    }

    clicked(fnc)
    {
        fnc();
    }

    getObjsToRender()
    {
        return this.objsToRender;
    }

    addObjToRender(obj)
        {
        if (obj && obj instanceof SceneObject)
        {
            this.objsToRender.push(obj);
        } else throw Error("Incorrect object has been pushed to render");
        
    }
}