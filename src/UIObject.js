import { SceneObject } from "./SceneObject.js";

export class UIObject extends SceneObject{
    constructor(renderInfo)
    {
        super(renderInfo)
        
    }

    clicked(fnc)
    {
        fnc();
    }
}