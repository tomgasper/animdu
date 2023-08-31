import { RenderableObject } from "../RenderableObject.js";
import { SceneObject } from "../SceneObject.js";

export class UIObject{
    UI;

    constructor(UIRef)
    {
        this.UI = UIRef;
    }

    objsToRender = [];

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

    setPosition(pos)
    {
        if (this.container && this.container instanceof SceneObject)
        {
            this.container.setPosition(pos);
        } else throw new Error("No/Incorrect container object of the UIObject!");
    }

    setParent(parent)
    {
        if (!(parent instanceof SceneObject)) throw new Error("Incorrect type of parent!");
        if (!this.container ||!(this.container instanceof SceneObject) ) throw new Error("No container to attach to!");

        this.container.setParent(parent);
    }

    addToUIList(dest)
    {
        this.UI.addObj(this.getObjsToRender(), dest);
    }
}