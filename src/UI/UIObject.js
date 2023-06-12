import { SceneObject } from "../SceneObject.js";

export class UIObject{
    UI;

    constructor(UIRef)
    {
        this.UI = UIRef;
    }

    objsToRender = [];

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

    addObjsToRender(obj_arr)
        {
            obj_arr.forEach((obj) => {
                this.addObjToRender(obj);
            })
    }

    removeObjs(scene, objs)
    {
        if (scene) scene.removeObjsFromScene(objs);

        objs.forEach( (obj) => {
            this.objsToRender = this.objsToRender.filter( objToRender => objToRender.id !== obj.id );
        })
    }
}