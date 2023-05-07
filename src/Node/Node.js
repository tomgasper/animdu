import { m3 } from "../utils.js";

export class Node
{
    id = Math.floor(Math.random() * Date.now());

    localMatrix = [1,0,0,
                    0,1,0,
                    0,0,1];

    worldMatrix = [1,0,0,
                    0,1,0,
                    0,0,1];

    
    parent = undefined;
    children = [];

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

    updateWorldMatrix(parentWorldMatrix)
    {
        if (parentWorldMatrix)
        {
            m3.multiplyInPlace(this.worldMatrix, parentWorldMatrix, this.localMatrix);
        } else {
            m3.copy(this.worldMatrix, this.localMatrix);
        }

        // process all the children
        const worldMatrix = this.worldMatrix;
        this.children.forEach((child) => {
            child.updateWorldMatrix(worldMatrix);
        });
    }
}