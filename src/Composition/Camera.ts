import { computeTransform } from '../utils';

export class Camera
{
    position : number[] = [0,0];
    zoom : number = 1;
    rotation : number = 0;

    origin = [0,0];

    matrix : number[] = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];

    setPosition(pos : number[])
    {
        if(pos && pos.length == 2)
        {
            if (typeof pos[0] !== "number" || typeof pos[1] !== "number") throw new Error("Wrong position data!");
            
            this.position = pos;
            // Transform must be matching
            this.updateTransform();
        } else throw Error("Wrong position input!");
    }

    setRotation(angle : number)
    {
        if (angle)
        {
            this.rotation = angle;
            this.updateTransform();
        }
    }

    setZoom(zoom : number)
    {
        if (typeof zoom!== "number") throw new Error("Wrong zoom data, must be a number!");

        this.zoom = zoom;
        this.updateTransform();
    }

    updateTransform()
    {
        this.matrix = computeTransform(this.position,this.rotation, [1 / this.zoom, 1 / this.zoom], this.origin);
    }
}