import { UINodeParam } from "./UI/NodeEditor/UINodeParam.js";
import { m3, computeTransform } from "./utils.js";

export class GeometryObject
{
    // If set to true can be detected by mouse move and picked up
    comp;

    id = Math.floor(Math.random() * Date.now());

    localMatrix = [1,0,0,
                    0,1,0,
                    0,0,1];

    worldMatrix = [1,0,0,
                    0,1,0,
                    0,0,1];

    
    parent = undefined;
    children = [];

    constructor()
    {
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
            visible: true,
            movable: true,
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

    setParent(parent)
    {
        // remove this node from parent
        if (this.parent)
        {
            const indx = this.parent.children.indexOf(this);
            if (indx >= 0)
            {
                this.parent.children.splice(indx,1);
            }
        }

        // Add this node to a new parent
        if (parent)
        {
            parent.children.push(this);
        }
        this.parent = parent;
    }

    deleteChild(child)
    {
        this.children = this.children.filter( (children) => children !== child );
    }

    updateWorldMatrix(parentWorldMatrix)
    {
        if (parentWorldMatrix)
        {
            m3.multiplyInPlace(this.worldMatrix, parentWorldMatrix, this.localMatrix);
        } else {
            m3.copy(this.worldMatrix, this.localMatrix);
        }

        // cancel out scaling for children
        let worldMatrix = this.worldMatrix;
        if (this.properties.scale[0] !== 1 || this.properties.scale[1] !== 1 )
        {
            worldMatrix = this.cancelScaling(worldMatrix);
        }

        // process all the children
        this.children.forEach((child) => {
            child.updateWorldMatrix(worldMatrix);
        });
    }
    
    // -------- Properties methods ------------

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

        this.properties.movable = canBe;
    }

    setBlending(isBlending)
    {
        if (typeof isBlending !== "boolean") throw Error("Wrong input!");

        this.properties.blending = isBlending;
    }

    setProjectionAndCalcFinalTransform(viewProjectionMat)
    {
        if (viewProjectionMat && viewProjectionMat.length == 9)
        {
            this.properties.projection = viewProjectionMat;
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

    setPropertyParam(param)
    {
        console.log(this);
        if (!(param instanceof UINodeParam)) throw new Error("Incorrect input type!");
        if ( this.properties[param.name] == undefined ) throw new Error("Object: " + this.name + "doesn't have property: " + param.name);
        if ( param.value == undefined ) throw new Error("Param value is undefined");

        this.properties[param.name] = param.value;
        this.updateTransform()
    }

    updateTransform()
    {
        this.localMatrix = computeTransform(this.properties.position,this.properties.rotation,this.properties.scale, this.properties.origin);
    }

    calcFinalTransform()
    {
        let viewProjectionMat = this.properties.projection;

        this.properties.transform =  m3.multiply(viewProjectionMat, this.worldMatrix);
    }

    setVisible(isVisible)
    {
        if (typeof isVisible !== "boolean" ) throw new Error("Incorrect type!");
        this.properties.visible = isVisible;
    }

    // -------- Handlers -----------
    setOnClick(fnc)
    {
        if (!(typeof fnc === "function")) throw new Error("Incorrect input, must be a function!");
        this.handlers.onClick = fnc;
    }

    // -------- Utils --------------

    cancelScaling(worldMatrix)
    {
        const unScaleMatrix = m3.scaling(1/this.properties.scale[0], 1/this.properties.scale[1]);
        const newParentMatrix = m3.multiply(worldMatrix, unScaleMatrix);

        return newParentMatrix;
    }
}