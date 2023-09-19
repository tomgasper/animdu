import { findNodesOfType } from "../utils.js";

import { ObjNode } from "../UI/Node/ObjNode.js";

import { ObjAnimation } from "./ObjAnimation.js";
import { ComponentNode } from "../UI/Node/ComponentNode.js";

const findConnectedComponents = (component) => {
    const componentList = [component];

    let currentComponent = component;

    // traverse via right handle of the node
    while (currentComponent)
    {
        // if there's no R connection then we're done
        const nodeHandleR = currentComponent.elements.handles.R[0];
        if (nodeHandleR.line.connection.isConnected === false) break;

        const connectedObj = nodeHandleR.line.connection.connectedObj.node;

        if (connectedObj instanceof ComponentNode)
        {
            currentComponent = connectedObj;
            componentList.push(currentComponent);
        } // only ComponentNode can be connected
        else break;
    }

    return componentList;
}

export const getCurrentCompositionNodes = (nodeSpace) =>
{
    // get objNodes that are inside UI Node Space and are connected to at least one component
    let objNodes = findNodesOfType(nodeSpace, ObjNode);
    objNodes = objNodes.filter( (objNode) => {
        return objNode.elements.handles.R[0].line.connection.isConnected;
    });

    return objNodes;
}

// should be called when starting an animation
// dont call every frame
const createAnimationList = (compositionNodesViewer) => {
    const objNodes = getCurrentCompositionNodes(compositionNodesViewer);

    const animationList = [];

    // create start point to walk through each obj components
    for (let objNode of objNodes)
    {
        const connectedObj = objNode.elements.handles.R[0].line.connection.connectedObj.node;

        if (connectedObj instanceof ComponentNode) {
            const connectedComponents = findConnectedComponents(connectedObj);
            const objAnimationList = new ObjAnimation(objNode.obj, connectedComponents);

            animationList.push(objAnimationList);
        }
    }

    return animationList;
}

export const constructAnimationQueue = ( nodesContainer ) =>
{
    let depTree = undefined;
    const animationList = createAnimationList(nodesContainer);

    console.log(animationList);   
}