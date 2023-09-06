import { m3, computeTransform } from "./utils.js";

import { TransformNode } from "./Node/TransformNode.js";

export class SceneObject extends TransformNode
{
    // If set to true can be detected by mouse move and picked up
    canBeMoved = true;
    comp;

    constructor()
    {
        super();

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
            projection : undefined,
            blending: false,
            highlight: true,
            visible: true
            // add height,width
        }

        this.handlers = {
            onClick : undefined,
            onInputKey: undefined
        }
    }

    assignToComp(comp)
    {
        this.comp = comp;
    }

    setID(id)
    {
        this.properties.id = id;
    }

    setPosition(pos)
    {
        if(pos && pos.length == 2)
        {
            if (typeof pos[0] !== "number" || typeof pos[1] !== "number") throw new Error("Wrong position data!");
            
            this.properties.position = pos;
            // Transform must be matching
            this.updateTransform();
        } else throw Error("Wrong position input!");
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

    setOriginalColor(color)
    {
        if (color && color.length === 4) { this.properties.originalColor = color; }
    }

    setCanBeHighlighted(canBe)
    {
        if ( typeof canBe !== "boolean") throw Error("Wrong input!");

        this.properties.highlight = canBe;
    }

    setCanBeMoved(canBe)
    {
        if (typeof canBe !== "boolean") throw Error("Wrong input!");

        this.canBeMoved = canBe;
    }

    setBlending(isBlending)
    {
        if (typeof isBlending !== "boolean") throw Error("Wrong input!");

        this.properties.blending = isBlending;
    }
    

    setProjectionAndCalcFinalTransform(projectionMat)
    {
        if (projectionMat && projectionMat.length == 9)
        {
            this.properties.projection = projectionMat;
            this.calcFinalTransform();

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

        this.updateTransform();
    }

    updateTransform()
    {
        this.localMatrix = computeTransform(this.properties.position,this.properties.rotation,this.properties.scale, this.properties.origin);
    }

    calcFinalTransform()
    {
        let viewProjectionMat = this.properties.projection;

        if (this.comp && this.comp.camera)
        {
            const viewMat = m3.inverse(this.comp.camera.matrix);
            viewProjectionMat = m3.multiply(this.properties.projection, viewMat);
        }

        this.properties.transform =  m3.multiply(viewProjectionMat, this.worldMatrix);
        
    }

    setVisible(isVisible)
    {
        if (typeof isVisible !== "boolean" ) throw new Error("Incorrect type!");
        this.properties.visible = isVisible;
    }

    // handlers

    setOnClick(fnc)
    {
        if (!(typeof fnc === "function")) throw new Error("Incorrect input, must be a function!");
        this.handlers.onClick = fnc;
    }
}