import { RenderableObject } from "../RenderableObject.js";
import { initUI } from "./initializeUI.js";

import { UINode } from "./Node/UINode.js";

import { UINodeParam } from "./Node/UINodeParam.js";
import { UINodeParamList } from "./Node/UINodeParamList.js";

export class UI
{
    app;
    objects = [];

    UIBuffers;
    font;
    
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

    addNode(paramList)
    {
        let params = paramList;

        if ( paramList instanceof UINodeParamList)
        {
            params = paramList;
        }
        else if ( typeof paramList == "string" ) {
            params = new UINodeParamList(paramList);
        } else throw Error ("Incorrect input!");

        const node = new UINode(this.app, params);
        node.setPosition([0,0]);

        this.addObj(node.getObjsToRender());
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