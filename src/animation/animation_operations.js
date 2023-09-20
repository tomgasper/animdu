import { findNodesOfType } from "../utils.js";

import { ObjNode } from "../UI/Node/ObjNode.js";

import { ObjAnimation } from "./ObjAnimation.js";
import { ComponentNode } from "../UI/Node/ComponentNode.js";

const findConnectedComponents = (startOffset, componentNode) => {
    const componentList = [
        {
            componentRef: componentNode,
            range: [startOffset, startOffset + componentNode.component.animation.duration]
        }];

    let currentComponent = componentNode;

    let accAnimationDuration = startOffset + componentNode.component.animation.duration + 1/60;

    // traverse via right handle of the node
    while (currentComponent)
    {
        // if there's no R connection then we're done
        const nodeHandleR = currentComponent.elements.handles.R[0];
        if (nodeHandleR.line.connection.isConnected === false) break;

        const lineConnection = nodeHandleR.line.connection;
        const connectedObj = lineConnection.connectedObj.node;

        if (connectedObj instanceof ComponentNode)
        {
            currentComponent = connectedObj;
            componentList.push(
                {
                    componentRef: currentComponent,
                    range: [accAnimationDuration + lineConnection.animationBreak,
                            accAnimationDuration + lineConnection.animationBreak + currentComponent.component.animation.duration]
                }
                );

                accAnimationDuration = accAnimationDuration + lineConnection.animationBreak + currentComponent.component.animation.duration + 1/60;
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
        const startOffset = objNode.elements.handles.R[0].line.connection.animationBreak;
        const connectedObj = objNode.elements.handles.R[0].line.connection.connectedObj.node;

        if (connectedObj instanceof ComponentNode) {
            const connectedComponents = findConnectedComponents(startOffset, connectedObj);
            const objAnimationList = new ObjAnimation(objNode.obj, connectedComponents);

            animationList.push(objAnimationList);
        }
    }

    return animationList;
}

export const procc = ( nodesContainer ) =>
{
    let depTree = undefined;
    const animationList = createAnimationList(nodesContainer);

    console.log(animationList);   
}