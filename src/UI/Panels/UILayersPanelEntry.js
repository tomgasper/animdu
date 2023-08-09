import { RenderableObject } from "../../RenderableObject.js";
import { UIObject } from "../UIObject.js";

import { getProjectionMat } from "../../utils.js";

import { createNewText } from "../../Text/textHelper.js";

export class UILayersPanelEntry extends UIObject
{
    index = undefined;
    objects = [];

    constructor(panelRef, parent, obj, i)
    {
        super();

        this.index = i;
        this.objects = this.create(panelRef, parent, obj, this.index);
    }

    create(panelRef, parent, obj, i)
    {
        // create container
        const projectionMat = getProjectionMat(panelRef.appRef.gl);

        const rectPos = [ 0, panelRef.y_offset + panelRef.entry_distance * i];

        const UILayerInfoContainerBuffer = panelRef.UIBuffers.container.buffer.getInfo();
        const rect = new RenderableObject(UILayerInfoContainerBuffer, projectionMat);
        rect.setCanBeMoved(false);
        rect.setPosition(rectPos);
        rect.setOriginalColor(panelRef.containerColor);
        rect.setParent(parent);

        // create text
        const txtColor = [0,0,0,1];
        const txt = createNewText(panelRef.appRef.gl, panelRef.appRef.programs[2], obj.id.toString(), 9, panelRef.UIRef.font, txtColor);
        // Retrive txtHeight from newly created buffer
        const txtHeight = txt.txtBuffer.str.rect[3];
        // const txtWidth = txt.txtBuffer.str.cpos[0];
        txt.setPosition([panelRef.x_offset, panelRef.UIRef.topBarHeight/2-txtHeight/2]);
        txt.setCanBeMoved(false);
        txt.setCanBeHighlighted(true);
        txt.setBlending(true);
        txt.setParent(rect);

        // delete button
        const UILayerInfoDeleteBtnBuffer = panelRef.UIBuffers.deleteButton.buffer.getInfo();
        const deleteButton = new RenderableObject(UILayerInfoDeleteBtnBuffer, projectionMat);
        deleteButton.setCanBeMoved(false);
        deleteButton.setPosition([panelRef.entry_width * 0.9, panelRef.entry_height/2]);
        deleteButton.setOriginalColor([255,0,0,1]);
        deleteButton.setParent(rect);

        deleteButton.handlers.onClick = () => {
            panelRef.appRef.activeComp.removeObj(obj);

            panelRef.entries.splice(this.index, 1);
            
            panelRef.updateEntries();
            this.remove(panelRef.UIRef);
        }
        
        parent.updateWorldMatrix();

        return [rect, txt, deleteButton];
    }

    update(panelRef, i)
    {
        this.index = i;

        console.log(this.objects[0]);

        this.objects[0].setPosition([0, panelRef.y_offset + panelRef.entry_distance * i]);
        this.objects[0].parent.updateWorldMatrix();
    }

    remove(UIRef)
    {
        console.log(this);
        // remove from toDraw list
        UIRef.removeObjs(this.objects, ["panels", "layers"]);

        this.objects = undefined;
    }
}