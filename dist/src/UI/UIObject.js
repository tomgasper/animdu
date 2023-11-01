import { RenderableObject } from "../RenderableObject.js";
export class UIObject extends RenderableObject {
    constructor(appRef, buffInfo) {
        super(buffInfo);
        this._ref = {
            app: undefined,
            UI: undefined
        };
        this.container = undefined;
        this.elements = {};
        this.name = "";
        this.style = {
            container: {
                width: undefined,
                height: undefined
            }
        };
        this._ref.app = appRef;
        this._ref.UI = appRef.UI;
    }
    getObjsToRender() {
        return this.objsToRender;
    }
    addObjToRender(obj) {
        if (obj && obj instanceof SceneObject) {
            this.objsToRender.push(obj);
        }
        else
            throw Error("Incorrect object has been pushed to render");
    }
    addObjsToRender(obj_arr) {
        obj_arr.forEach((obj) => {
            this.addObjToRender(obj);
        });
    }
    removeObjs(scene, objs) {
        if (scene)
            scene.removeObjsFromScene(objs);
        objs.forEach((obj) => {
            this.objsToRender = this.objsToRender.filter(objToRender => objToRender.id !== obj.id);
        });
    }
    addToUIList(dest) {
        this._ref.UI.addObj(this.getObjsToRender(), dest);
    }
    setName(name) {
        this.name = name;
    }
}
//# sourceMappingURL=UIObject.js.map