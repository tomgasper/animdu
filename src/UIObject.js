import { SceneObject } from "./SceneObject.js";

export class UIObject extends SceneObject{
    constructor(renderInfo, projectionMat)
    {
        super(renderInfo, projectionMat)
        
    }

    clicked(fnc)
    {
        fnc();
    }
}