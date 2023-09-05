import { RenderableObject } from "../RenderableObject.js";
import { SceneObject } from "../SceneObject.js";

export class UIObject{
    _ref = 
    {
        app: undefined,
        UI: undefined
    }

    container = undefined;
    elements = {};

    name = "";
    style = {
        container:
        {
            width: undefined,
            height: undefined
        }
    }


    constructor(appRef)
    {
        this._ref.app = appRef;
        this._ref.UI = appRef.UI;
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

    setPosition(pos)
    {
        if (this.container && this.container instanceof SceneObject)
        {
            this.container.setPosition(pos);
        } else throw new Error("No/Incorrect container object of the UIObject!");
    }

    setVisible(isVisible)
    {
        this.container.setVisible(isVisible);
    }

    setParent(parent)
    {
        if (!(parent instanceof RenderableObject || parent instanceof UIObject)) throw new Error("Incorrect type of parent!");
        if (!this.container || !(this.container instanceof RenderableObject) ) throw new Error("No container to attach to!");

        // Save ref
        if (parent instanceof UIObject) this._ref.parent = parent;

        let newParent = parent instanceof UIObject ? parent.container : parent;
        this.container.setParent(newParent);
    }

    addToUIList(dest)
    {
        this._ref.UI.addObj(this.getObjsToRender(), dest);
    }

    setName(name)
    {
        this.name = name;
    }
}