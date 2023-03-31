import { GeometryObject } from "./Primitives/GeometryObject.js";
import { m3, computeTransform } from "./utils.js";

export class SceneObject extends GeometryObject
{

    canBeMoved = true;

    constructor(renderInfo)
    {
        super(renderInfo)

        this.properties = {
            id: [0,0,0,1],
            color: [0.5, 0.7, 0.2, 1],
            originalColor: [0.1, 0.6, 0.4, 1],
            position: [0,0],
            scale: [1,1],
            rotation: 0,
            origin: [0,0],
            transform: [ 1, 0, 0,
                        0, 1, 0,
                        0, 0, 1 ],
            projection : undefined
        }
    }

    setID(id)
    {
        this.properties.id = id;
    }

    setPosition(pos)
    {
        if(pos && pos.length == 2)
        {
            this.properties.position = pos;
            // Transform must be matching
            this.updateTransform();
        }
    }

    setRotation(angle)
    {
        if (angle)
        {
            this.properties.rotation = angle;
            this.updateTransform();
        }
    }

    setScale(scale)
    {
        if (scale && scale.length == 2)
        {
            this.properties.scale = scale;
            this.updateTransform();
        } else {
            throw new Error("Invalid input - projection matrix");
        }

    }

    setOrigin(origin)
    {
        if (origin && origin.length == 2)
        {
            this.properties.origin = origin;
            this.updateTransform();
        }
    }

    setColor(color)
    {
        if (color && color.length === 4) { this.properties.color = color; }
    }

    setProjection(projectionMat)
    {
        if (projectionMat && projectionMat.length == 9)
        {
            this.properties.projection = projectionMat;
        } else {
            throw new Error("Invalid input - projection matrix");
        }
    }

    setPosRotScaleOrigin(pos,rot,scale,origin)
    {
        this.setPosition(pos);
        this.setRotation(rot);
        this.setScale(scale);
        this.setOrigin(origin);
    }

    updateTransform()
    {
        this.properties.transform = computeTransform(this.properties.position,this.properties.rotation,this.properties.scale, this.properties.origin);
    }
}