import { findNodesOfType } from "../utils.js";
import { ObjNode } from "../UI/NodeEditor/ObjNode.js";
import { ObjAnimation } from "./ObjAnimation.js";
import { Digraph } from "../DataStructures/Digraph.js";
export const createComponentList = (startOffset, componentNode) => {
    // Obj to return
    const componentList = [
        {
            componentRef: componentNode,
            range: [startOffset, startOffset + componentNode.component.animation.duration]
        }
    ];
    let currentComponent = componentNode;
    const DELAY = 1 / 60;
    let accAnimationDuration = startOffset + componentNode.component.animation.duration + DELAY;
    // traverse via right handle of the node
    while (currentComponent) {
        // if there's no R connection then we're done
        const nodeHandleR = currentComponent.elements.handles.R[0];
        if (nodeHandleR.line.connection.isConnected === false)
            break;
        const lineConnection = nodeHandleR.line.connection;
        const connectedObj = lineConnection.connectedObj.node;
        if (connectedObj.getType() == "_NODE_COMPONENT") {
            currentComponent = connectedObj;
            componentList.push({
                componentRef: currentComponent,
                range: [accAnimationDuration + lineConnection.animationBreak,
                    accAnimationDuration + lineConnection.animationBreak + currentComponent.component.animation.duration]
            });
            accAnimationDuration = accAnimationDuration + lineConnection.animationBreak + currentComponent.component.animation.duration + 1 / 60;
        } // only ComponentNode can be connected
        else
            break;
    }
    return componentList;
};
export const getObjNodes = (nodeSpace) => {
    // Get ObjNodes that are inside UI Node Space
    let objNodes = findNodesOfType(nodeSpace, ObjNode);
    // Filter out ObjNodes that are not connected to any component
    objNodes = objNodes.filter((objNode, indx) => {
        return objNode.getConnection("R", indx).isConnected;
    });
    return objNodes;
};
// should be called when starting an animation
// dont call every frame
const createAnimationList = (compositionNodesViewer) => {
    const objNodes = getObjNodes(compositionNodesViewer);
    const animationList = [];
    // create start point to walk through each obj components
    for (let objNode of objNodes) {
        // seqConnection is a connection between nodes that creates a sequence
        // handles with index 0 are reserved for seqConnection
        const seqConnection = objNode.getConnection("R", 0);
        const connectedNode = objNode.getConnectedNode("R", 0);
        const startOffset = seqConnection.animationBreak;
        if (connectedNode.getType() === "_NODE_COMPONENT") {
            const connectedComponents = createComponentList(startOffset, connectedNode);
            const objAnimationList = new ObjAnimation(objNode.getObj(), connectedComponents);
            animationList.push(objAnimationList);
        }
    }
    return animationList;
};
export const gatherComponentsAtTime = (time, animationList) => {
    const activeObjsAtTime = [];
    for (let obj of animationList) {
        // Check which components are active at current animation time
        for (let component of obj.componentsToProcess) {
            if (time >= component.range[0] && time <= component.range[1]) {
                activeObjsAtTime.push(component.componentRef);
                break;
            }
        }
    }
    const V = activeObjsAtTime.length;
    let depGraph = new Digraph(V);
    // Check what's connected to active componentNodes(dependency)
    for (let i = 0; i < activeObjsAtTime.length; i++) {
        const inputHandles = activeObjsAtTime[i].elements.handles.L;
        for (let j = 1; j < inputHandles.length; j++) {
            const connectedObj = inputHandles[j].getLineConnectedNode();
            // no connection -> leave
            if (!connectedObj)
                continue;
            for (let k = 0; k < activeObjsAtTime.length; k++) {
                // ComponentNodes are dynamic and affect other Nodes so we have to mark it as a dependency
                // In the future here will be also added check for VarNode
                if (connectedObj === activeObjsAtTime[k]) {
                    // need to use depedency graph
                    // and then do topological sort
                    // https://en.wikipedia.org/wiki/Topological_sorting
                    const A = i;
                    const B = k;
                    depGraph.addEdge(A, B);
                }
            }
        }
    }
    // Calculate proper processing order
    // const actionsOrder = depGraph.topologicalSort().reverse();
    const actionsOrder = depGraph.topologicalSort();
    // Sort active objects
    const sortedActiveObjs = [];
    for (let i = 0; i < actionsOrder.length; i++) {
        sortedActiveObjs.push(activeObjsAtTime[actionsOrder[i]]);
    }
    return sortedActiveObjs;
};
const exeEffectorFnc = (animTime, INList, fncNode) => {
    const out = fncNode.effector.fnc(animTime, ...INList);
    return out;
};
const processInputParamNode = (activeComponent, handle) => {
    const paramNodeIndx = handle.line.connection.connectedObj.node.indx;
    const connectedHandle = handle.line.connection.connectedObj;
    // External connection to component node
    const connectedObj = activeComponent.getConnectedNode("L", paramNodeIndx);
    let obj;
    if (connectedObj.type === "_NODE_OBJ") {
        obj = connectedObj.getObj();
    }
    else if (connectedObj.type === "_NODE_COMPONENT") {
        // here it should read data frmo correct outpu
        obj = connectedObj.component.activeObj;
    }
    else
        throw new Error("Wrong output!");
    // change value of parameter connected to param node
    const geometryObjParamVal = obj.properties[connectedHandle.parameter.name];
    connectedHandle.setParameterVal(geometryObjParamVal);
    // Update text as well
    connectedHandle.node.updateText();
    return connectedHandle.parameter.value;
};
const processInputVarNode = (handle) => {
};
const setOUTvalues = (activeComponent) => {
    // set values from OUTparamNodes
    const componentOUTNodes = activeComponent.component.elements.nodes.OUT;
    for (let i = 0; i < componentOUTNodes.length; i++) {
        const paramsList = componentOUTNodes[i].getParams();
        const paramNodeIndx = componentOUTNodes[i].getCorrespondingComponentHandleIndx();
        // get object that is connected Component Node based on index
        const compConnection = activeComponent.getConnection("L", paramNodeIndx);
        if (!compConnection.isConnected)
            continue;
        const connectedObj = compConnection.connectedObj.node;
        let objToSet;
        if (connectedObj.type === "_NODE_OBJ") {
            objToSet = connectedObj.obj;
        }
        else if (connectedObj.type === "_NODE_COMPONENT") {
            objToSet = connectedObj.component.activeObj;
        }
        else
            throw new Error("Wrong output!");
        for (let param of paramsList) {
            console.log(param);
            console.log(objToSet);
            objToSet.setPropertyParam(param);
        }
    }
};
const processActiveComponent = (animTime, activeComponent) => {
    // Will be extended to be able to process more than one function node
    const fncNode = activeComponent.getFunctionNode()[0];
    const IN_fnc = fncNode.elements.handles.L;
    const OUT_fnc = fncNode.elements.handles.R;
    const INRefList = [];
    const beforeParams = [];
    for (let i = 0; i < IN_fnc.length; i++) {
        const handle = IN_fnc[i];
        if (handle.line.connection.isConnected) {
            const connectedObj = handle.getLineConnectedNode();
            const connectedObjType = connectedObj.getType();
            switch (connectedObjType) {
                case "_NODE_PARAM_IN":
                    INRefList[i] = processInputParamNode(activeComponent, handle);
                    break;
                case "_NODE_VAR":
                    // To do
                    // INRefList[indx] = processInputVarNode(handle);
                    break;
                default:
                    throw new Error("Wrong input node type!");
            }
        }
    }
    // call FNC
    // main part
    const functionOutput = exeEffectorFnc(animTime, INRefList, fncNode);
    // move values to nodes connected to out lines
    for (let i = 0; i < OUT_fnc.length; i++) {
        const handle = OUT_fnc[i];
        if (handle.line.connection.isConnected) {
            const connectedObj = handle.line.connection.connectedObj;
            connectedObj.setParameterVal(functionOutput[i]);
            connectedObj.node.updateText();
        }
    }
    setOUTvalues(activeComponent);
};
const processActiveComponents = (animTime, activeObjectsList) => {
    for (let i = 0; i < activeObjectsList.length; i++) {
        processActiveComponent(animTime, activeObjectsList[i]);
    }
};
export const procc = (animTime, nodesContainer) => {
    // check if you're dealing with the same components
    // use caching if so
    const animationList = createAnimationList(nodesContainer);
    const sortedActiveObjects = gatherComponentsAtTime(animTime, animationList);
    processActiveComponents(animTime, sortedActiveObjects);
};
//# sourceMappingURL=animation_operations.js.map