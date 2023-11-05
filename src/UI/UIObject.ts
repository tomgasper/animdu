import { RenderableObject } from "../RenderableObject.js";

import { ContainerStyle } from "./NodeEditor/NodeEditorStyleTypes.js";

interface RefType {
    [key: string] : any
};

export class UIObject extends RenderableObject{

    protected _ref : RefType=
    {
        app: undefined,
        UI: undefined
    }

    container = undefined;
    elements = {};

    containerStyle : ContainerStyle =
    {
        width: undefined,
        height: undefined,
        colour: undefined
    };

    style = {
        container: this.containerStyle
    }


    constructor(appRef : any, buffInfo)
    {
        super(buffInfo);

        this._ref.app = appRef;
        this._ref.UI = appRef.UI;
    }

    /*

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

    addToUIList(dest)
    {
        this._ref.UI.addObj(this.getObjsToRender(), dest);
    }

    */

    setName(name : number)
    {
        this.name = name;
    }
}