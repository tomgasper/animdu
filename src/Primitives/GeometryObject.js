import { m3, computeTransform  } from "../utils.js"

export class GeometryObject
{
    // This class will actually allow to create "backend" for each object
    // We will be changing parameters of this object and then sending this new changed object
    // to the render pipeline
    constructor(bufferInfo, vertexArrInfo, drawInfo, programInfo)
    {
        // ok this will be some object which points to proper buffer
        this.bufferInfo = bufferInfo;
        this.vertexArrInfo = vertexArrInfo;
        this.drawInfo = drawInfo;
        this.programInfo = programInfo;

        this.ID = "Geometry Object";

        // local copy of shader for this object
        this.color = [0.5, 0.7, 0.2, 1];

        this.position = [0,0];
        this.scale = [1,1];
        this.rotation = 0;
        this.origin = [0,0];

        this.transform =
        [ 1, 0, 0,
          0, 1, 0,
          0, 0, 1
        ];

        this.projectionMat;
    }

    setPosition(pos)
    {
        if(pos && pos.length == 2)
        {
            this.position = pos;
            // Transform must be matching
            this.transform = m3.translate(this.transform, this.position[0],this.position[1]);
        }
    }

    setRotation(angle)
    {
        if (angle)
        {
            this.rotation = angle;
            this.transform = m3.rotate(this.transform, this.rotation);
        }
    }

    setScale(scale)
    {
        if (scale && scale.length == 2)
        {
            this.scale = scale;
            this.transform = m3.scale(this.transform, this.scale[0], this.scale[1]);
        } else {
            throw new Error("Invalid input - projection matrix");
        }

    }

    setOrigin(origin)
    {
        if (origin && origin.length == 2)
        {
            this.origin = origin;
            this.transform = m3.translate(this.transform, this.origin[0], this.origin[1]);
        }
    }

    setColor(color)
    {
        if (color) { this.color = color; }
    }

    setProjection(projectionMat)
    {
        if (projectionMat && projectionMat.length == 9)
        {
            this.projectionMat = projectionMat;
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

        this.transform = computeTransform(this.position,this.rotation,this.scale, this.origin);
    }
}