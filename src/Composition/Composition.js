import { RenderableObject } from "../RenderableObject.js";

export class Composition
{
    app;
    objects = [];
    id;
    name;
    
    constructor(app, name)
    {
        // Save ref to the app
        this.app = app;
        this.id = app.comps.length;
        this.name = name;
    }

    addObj(obj)
    {
        // handle array of objects
        if (obj.length && obj.length > 1)
        {
            obj.forEach((obj) => {
                if (obj && obj instanceof RenderableObject) this.objects.push(obj);
            });
        } else if (obj instanceof RenderableObject) this.objects.push(obj);
    }

    getObjs()
    {
        return this.objects;
    }
}