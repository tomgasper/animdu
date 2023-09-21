import { findNodesOfType } from "../utils.js";

import { ObjNode } from "../UI/Node/ObjNode.js";

import { ObjAnimation } from "./ObjAnimation.js";
import { ComponentNode } from "../UI/Node/ComponentNode.js";

import { Digraph } from "../DataStructures/Digraph.js";

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

const gatherComponentsAtTime = (time, animationList) =>
{
    const activeObjsAtTime = [];

    for (let obj of animationList)
    {
        // check which components are actie at current animation time
        for (let component of obj.componentsToProcess)
        {
            console.log(component.componentRef.component.name);
            if ( time >= component.range[0] && time <= component.range[1])
            {
                activeObjsAtTime.push(component.componentRef);
                break;
            }
        }
    }


    const V = activeObjsAtTime.length;
    let depGraph = new Digraph(V);

    // check what's connected to active componentNodes(dependency)
    for (let i = 0; i < activeObjsAtTime.length; i++)
    {
        const inputHandles = activeObjsAtTime[i].elements.handles.L;
        for (let j = 1; j < inputHandles.length; j++)
        {
            // no connection -> leave
            if ( !(inputHandles[j].line.connection.isConnected)) continue;

            const connectedObj = inputHandles[j].line.connection.connectedObj.node;

            for (let k = 0; k < activeObjsAtTime.length; k++)
            {
                // ComponentNodes do change so we have to mark it as a dependency
                // In the future here will be also added check for VarNode
                if (connectedObj === activeObjsAtTime[k])
                {
                    // need to use depedency graph
                    // and then do topological sort
                    // https://en.wikipedia.org/wiki/Topological_sorting
                    const A = i;
                    const B = k;

                    depGraph.addEdge(A,B);
                }
            }
        }
    }

    // Calculate proper processing order
    const actionsOrder = depGraph.topologicalSort();
    // Sorted active objects
    const sortedActiveObjs = [];
    for (let i = 0; i < actionsOrder.length; i++)
    {
        // sortedActiveObjs.push(activeObjsAtTime[i]);
        sortedActiveObjs.push(activeObjsAtTime[actionsOrder[i]].component.name);
    }

    console.log(sortedActiveObjs);
}

/*
const printTree = (tree) => {
    function traverse(childrenStr, treeNode)
    {
        if (!treeNode) return childrenStr;

        let line = "";
        if (treeNode.children.length >= 1)
        {
            for (let i = 0; i < treeNode.children.length; i++)
            {
                line = line + traverse(line, treeNode.children[i]);
                // childrenStr = childrenStr + '\n' + fullLine;
            }
            line = line + '\n';
        }

        line = line + " " + treeNode.value.component.name;
        return line;
    }

    let strTree = "";
    const returnStr = traverse(strTree, tree);

    console.log(returnStr);
    console.log(strTree);
}

const findInTree = (tree, val) =>
{
    if (!this) return undefined;
    if (this.val === val) return this;

    for (let treeNode of tree.children)
    {
        return findInTree(treeNode);
    }
}
*/

export const procc = ( animTime, nodesContainer ) =>
{
    let depTree = undefined;
    const animationList = createAnimationList(nodesContainer);

    gatherComponentsAtTime(animTime, animationList);
}