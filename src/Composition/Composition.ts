import { RenderableObject } from '../RenderableObject';
import { Camera } from './Camera';

import { ObjNode } from '../UI/NodeEditor/ObjNode';

import { anyObj } from '../types/globalTypes';
import { UISceneViewport } from '../UI/UISceneViewport';

export class Composition
{
    objects : RenderableObject[] = [];
    id : number;
    name : string;
    camera : Camera;
    viewportRef : UISceneViewport | undefined;
    offset : number[] = [0,0];
    animations = [];

    constructor(id : number = Math.floor(Math.random() * 100), name : string, viewportRef : UISceneViewport)
    {
        this.id = id;
        this.name = name;
        this.viewportRef = viewportRef;
        this.camera = new Camera();
    }

    addObj(obj : RenderableObject )
    {
        if (obj && obj instanceof RenderableObject) {

            // Don't like this tbh
            // Assigning here and in object properties
            obj.assignToComp(this);
            this.objects.push(obj);

            // Delete later?
            if (!obj.parent && this.viewportRef) obj.setParent(this.viewportRef);
        }
        else throw new Error("Incorrect input type!");
    }

    addMultipleObjs(objs : RenderableObject[])
    {
        for (let i = 0; i < objs.length; i++)
        {
            let obj : RenderableObject = objs[i];
            this.addObj(obj);
        }
    }

    removeObj(obj : RenderableObject)
    {
        this.objects.forEach((arr_obj, indx, arr) => {
            if (arr_obj.id == obj.id)
            {
                obj.assignToComp(undefined);
                arr.splice(indx, 1);

                // only one of the obj with a give id is possible so return after deleting it
                return;
            }
        });
    }

    getObjs()
    {
        return this.objects;
    }

    getCamera() : Camera
    {
        return this.camera;
    }
}