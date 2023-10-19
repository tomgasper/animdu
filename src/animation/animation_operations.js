import { computeTransform, findNodesOfType } from "../utils.js";

import { ObjNode } from "../UI/NodeEditor/ObjNode.js";

import { ObjAnimation } from "./ObjAnimation.js";
import { ComponentNode } from "../UI/NodeEditor/ComponentNode.js";

import { Digraph } from "../DataStructures/Digraph.js";

export const createComponentList = (startOffset, componentNode) => {
    // Obj to return
    const componentList = [
        {
            componentRef: componentNode,
            range: [startOffset, startOffset + componentNode.component.animation.duration]
        }];

    let currentComponent = componentNode;

    const DELAY = 1/60;
    let accAnimationDuration = startOffset + componentNode.component.animation.duration + DELAY;

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
            const connectedComponents = createComponentList(startOffset, connectedObj);
            const objAnimationList = new ObjAnimation(objNode.obj, connectedComponents);

            animationList.push(objAnimationList);
        }
    }

    return animationList;
}

export const gatherComponentsAtTime = (time, animationList) =>
{
    const activeObjsAtTime = [];

    for (let obj of animationList)
    {
        // Check which components are active at current animation time
        for (let component of obj.componentsToProcess)
        {
            if ( time >= component.range[0] && time <= component.range[1])
            {
                activeObjsAtTime.push(component.componentRef);
                break;
            }
        }
    }

    const V = activeObjsAtTime.length;
    let depGraph = new Digraph(V);

    // Check what's connected to active componentNodes(dependency)
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
                // ComponentNodes are dynamic and affect other Nodes so we have to mark it as a dependency
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
    // const actionsOrder = depGraph.topologicalSort().reverse();
    const actionsOrder = depGraph.topologicalSort();

    // Sort active objects
    const sortedActiveObjs = [];
    for (let i = 0; i < actionsOrder.length; i++)
    {
        sortedActiveObjs.push(activeObjsAtTime[actionsOrder[i]]);
    }

    return sortedActiveObjs;
}

const exeEffectorFnc = (animTime, INList, fncNode) => {
    const out = fncNode.effector.fnc(animTime, ...INList);

    return out;
}

const processInputParamNode = (activeObj, handle) => {
    const paramNodeIndx = handle.line.connection.connectedObj.node.indx;
    const connectedObj = activeObj.elements.handles.L[paramNodeIndx].line.connection.connectedObj.node;
    const connectedParam = handle.line.connection.connectedObj.parameter;

    let obj;

    if (connectedObj.type === "_NODE_OBJ")
    {
        obj = activeObj.elements.handles.L[paramNodeIndx].line.connection.connectedObj.node.obj;
    } else if (connectedObj.type === "_NODE_COMPONENT")
    {
        obj = activeObj.elements.handles.L[paramNodeIndx].line.connection.connectedObj.node.component.activeObj;
    } else throw new Error("Wrong output!");

    // save inputs for effector function
    connectedParam.value = obj.properties[connectedParam.name];

    // update node's text
    handle.line.connection.connectedObj.node.updateText();

    return connectedParam.value;
}

const processInputVarNode = (handle) => {

}

const setOUTvalues = (activeObj) => {
    // set values from OUTparamNodes
    const activeObjOUTNodes = activeObj.component.elements.nodes.OUT;

    for (let i = 0; i < activeObjOUTNodes.length; i++)
    {
        const paramsList = activeObjOUTNodes[i].parameters;
        const paramNodeIndx = activeObjOUTNodes[i].indx;

        // get object that is connected Component Node based on index
        if (!activeObj.elements.handles.L[paramNodeIndx].line.connection.isConnected) continue;
        const connectedObj = activeObj.elements.handles.L[paramNodeIndx].line.connection.connectedObj.node;
        let inputObjToSet;

        if (connectedObj.type === "_NODE_OBJ")
        {
            inputObjToSet = connectedObj.obj;
        } else if (connectedObj.type === "_NODE_COMPONENT")
        {
            inputObjToSet = connectedObj.component.activeObj;
        } else throw new Error("Wrong output!");

        for (let param of paramsList)
        {
            inputObjToSet.properties[param.name] = param.value;
            inputObjToSet.updateTransform();
        }
    }
}

const processActiveObject = (animTime, activeObj) => {
    console.log("Processing: " + activeObj.component.name);

    const fncNode = activeObj.component.elements.nodes.FNC[0];

    const IN = fncNode.elements.handles.L;
    const OUT = fncNode.elements.handles.R;

    const INRefList = [];
    const beforeParams = [];

    IN.forEach( (handle, indx) => {
        if (handle.line.connection.isConnected)
        {
            const connectedObj = handle.line.connection.connectedObj.node;
            const connectedObjType = connectedObj.type;

            switch(connectedObjType)
            {
                case "_NODE_PARAM_IN":
                    INRefList[indx] = processInputParamNode(activeObj, handle);
                    break;
                case "_NODE_VAR":
                    INRefList[indx] = processInputVarNode(handle);
                    break;
                default:
                    throw new Error("Wrong input node type!");
            }

        }
    });

    // call FNC
    // main part
    const functionOutput = exeEffectorFnc(animTime, INRefList, fncNode);

    // move values to nodes connected to out lines
    for (let i = 0; i < OUT.length; i++)
    {
        const handle = OUT[i];

        if (handle.line.connection.isConnected)
        {
            const connectedObj = handle.line.connection.connectedObj;

            connectedObj.parameter.value = functionOutput[i];
            connectedObj.node.updateText();
        }
    }

    setOUTvalues(activeObj);
}

const processActiveObjects = (animTime, activeObjectsList) => 
{
    for (let i = 0; i < activeObjectsList.length; i++)
    {
        processActiveObject(animTime, activeObjectsList[i]);
    }
}

export const procc = ( animTime, nodesContainer ) =>
{
    // check if you're dealing with the same components
    // use caching if so
    const animationList = createAnimationList(nodesContainer);
    const sortedActiveObjects = gatherComponentsAtTime(animTime, animationList);
    processActiveObjects(animTime, sortedActiveObjects);
}