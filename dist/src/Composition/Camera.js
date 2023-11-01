import { computeTransform } from "../utils.js";
export class Camera {
    constructor() {
        this.position = [0, 0];
        this.zoom = 1;
        this.rotation = 0;
        this.origin = [0, 0];
        this.matrix = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }
    setPosition(pos) {
        if (pos && pos.length == 2) {
            if (typeof pos[0] !== "number" || typeof pos[1] !== "number")
                throw new Error("Wrong position data!");
            this.position = pos;
            // Transform must be matching
            this.updateTransform();
        }
        else
            throw Error("Wrong position input!");
    }
    setRotation(angle) {
        if (angle) {
            this.rotation = angle;
            this.updateTransform();
        }
    }
    setZoom(zoom) {
        if (typeof zoom !== "number")
            throw new Error("Wrong zoom data, must be a number!");
        this.zoom = zoom;
        this.updateTransform();
    }
    updateTransform() {
        this.matrix = computeTransform(this.position, this.rotation, [1 / this.zoom, 1 / this.zoom], this.origin);
    }
}
//# sourceMappingURL=Camera.js.map