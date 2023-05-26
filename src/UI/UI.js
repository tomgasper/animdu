import { RenderableObject } from "../RenderableObject.js";
import { initUI } from "./initializeUI.js";

export class UI
{
    app;
    objects = [];

    UIBuffers;
    
    constructor(app)
    {
        // Save ref to the app
        this.app = app;

        this.start(app);
    }

    start(app)
    {
        initUI(app, this);
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