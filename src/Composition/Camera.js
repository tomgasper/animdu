import { computeTransform } from "../utils.js";

export class Camera
{
    position = [0,0];
    zoom = 1;
    rotation = 0;

    origin = [0,0];

    matrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];

    constructor()
    {

    }

    setPosition(pos)
    {
        if(pos && pos.length == 2)
        {
            if (typeof pos[0] !== "number" || typeof pos[1] !== "number") throw new Error("Wrong position data!");
            
            this.position = pos;
            // Transform must be matching
            this.updateTransform();
        } else throw Error("Wrong position input!");
    }

    setRotation(angle)
    {
        if (angle)
        {
            this.rotation = angle;
            this.updateTransform();
        }
    }

    setZoom(zoom)
    {
        if (typeof zoom!== "number") throw new Error("Wrong zoom data, must be a number!");

        this.zoom = zoom;
        this.updateTransform();
    }

    updateTransform()
    {
        this.matrix = computeTransform(this.position,this.rotation, [this.zoom, this.zoom], this.origin);
    }
}