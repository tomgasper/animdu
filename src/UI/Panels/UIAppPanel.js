/* import { RenderableObject } from "../../RenderableObject";
import { UIObject } from "../UIObject";

import { getProjectionMat } from "../../utils";

class UIAppPanel extends UIObject
{
    // objsToRender = [];
    marginX = 0.;
    marginY = 0.;

    offsetY = 50.0;

    // we must input objects from current comp
    constructor(gl, app, comp)
    {
        this.gl = gl;
        this.app = app;
        this.currentComp = comp;

        this.UIBuffers = this.app.UIBuffers.UILayerInfo;

        this.renderPanel(app.objsToDraw);

        console.log("I'm working yaaay!");
    }

    renderPanel(compObjs)
    {
        // for each object render one UI Element
        compObjs.forEach(obj => {
            const newLayerRect = this.renderLayerInfo();
        });
    }

    renderLayerInfo()
    {
        // create container
        const projectionMat = getProjectionMat(this.app.gl);

        const UILayerInfoContainerBuffer = this.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UILayerInfoContainerBuffer, projectionMat);
        rect.setPosition([++this.offsetY,0]);
        rect.setOriginalColor(this.containerColor);

        this.addObjsToRender(rect);

        return rect;
    }
}
*/