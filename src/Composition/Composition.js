import { RenderableObject } from "../RenderableObject.js";

export class Composition
{
    app;
    objects = [];
    id;
    name;

    viewport;
    offset = [0,0];
    
    constructor(app, name, viewport)
    {
        // Save ref to the app
        this.app = app;
        this.id = app.comps.length;
        this.name = name;

        this.viewport = viewport;
    }

    addObj(obj)
    {
        // handle array of objects
        if (obj.length && obj.length > 1)
        {
            obj.forEach((obj) => {
                if (obj && obj instanceof RenderableObject) { obj.assignToComp(this); this.objects.push(obj); }
            });
        } else if (obj instanceof RenderableObject) this.objects.push(obj);
    }

    removeObj(obj)
    {
        this.objects.forEach((arr_obj, indx, arr) => {
            if (arr_obj.id == obj.id)
            {
                arr.splice(indx, 1);
    
                // only one of the obj with a give id is possible so return after deleting it
                return;
            }
        });

        obj = undefined;
    }

    getObjs()
    {
        return this.objects;
    }
}