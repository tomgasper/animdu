import { RectangleBuffer } from "../Primitives/RectangleBuffer";

import { SceneObject } from "../SceneObject";

import { getProjectionMat } from "../utils";

export class UINode extends SceneObject
{
    height = 200;
    width = 200;

    constructor(scene)
    {
        this.scene = scene;

        this.initialize();
    }

    initialize()
    {
        const projectionMat = getProjectionMat(this.scene.gl);

        // move primitiveBuffers to global
        const obj1 = new SceneObject(this.scene.primitiveBuffers.rectangle, projectionMat );
        obj1.setPosition([150,250]);
        obj1.setScale([1,1]);

        this.scene.addObjToScene(obj1);
    }
}