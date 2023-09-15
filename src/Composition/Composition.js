import { RenderableObject } from "../RenderableObject.js";
import { Camera } from "./Camera.js";

import { ObjNode } from "../UI/Node/ObjNode.js";

export class Composition
{
    app;
    objects = [];
    id;
    name;

    camera;

    viewport;
    offset = [0,0];

    animations = [];
    
    constructor(app, name, viewport)
    {
        // Save ref to the app
        this.app = app;
        this.id = app.comps.length;
        this.name = name;

        this.viewport = viewport;

        this.camera = new Camera();
    }

    addObj(obj)
    {
        // handle array of objects
        if (obj.length && obj.length > 1)
        {
            obj.forEach((obj) => {
                if (obj && obj instanceof RenderableObject) {
                    obj.assignToComp(this);
                    this.objects.push(obj);
                    if (!obj.parent) obj.setParent(this.viewport);
                }
            });
        } else if (obj instanceof RenderableObject) this.objects.push(obj);
    }

    removeObj(obj)
    {
        this.objects.forEach((arr_obj, indx, arr) => {
            if (arr_obj.id == obj.id)
            {
                arr.splice(indx, 1);
    
                // only one of the obj with a give id is possible so return after deleting it
                return;
            }
        });

        obj = undefined;
    }

    getObjs()
    {
        return this.objects;
    }

    findStartComponents()
    {
        const activeViewer = this.app.UI.viewer;

        const compsToProcess = new Set();

        let findStart = (c) => {
            if (!c) return undefined;

            const handleL = c.elements.outside.elements.handles.L[0];
            if ( handleL.line.connection.connectedObj.node instanceof ObjNode) return c;

            return findStart(handleL.line.connection.connectedObj.node.component);
        }

        activeViewer.components.forEach( (component) => {
            let componentStart = findStart(component);
            if (componentStart && !compsToProcess.has(componentStart) ) compsToProcess.add(componentStart);
        });

        return compsToProcess;
    }

    calculateAnimation(animationList)
    {
        // animation list
        // Input:
        /*
        {
            {
                obj: objRef,
                params: {
                    position: [ [0,0], [100,0]],
                    scale: [[1,1], [2,2] ]
            },
            {
                obj: objRef2,
                params: {
                    position: [ [0,0], [100,0]],
                    scale: [[1,1], [2,2] ]
            },
        }


        Output:
        {
            {
                obj: objRef,
                params:{
                    param1: [
                        [0,0], [0,1],...
                    ]
                }
            }
        }
        */

        let steps = 500;

        console.log(animationList);


        // linear interpolation
        const outList = [];

        animationList.forEach( (animObj) => {
            const objAnimation = 
            {
                obj: animObj.obj,
                steps: steps,
                params: []
            };

            animObj.params.forEach( (param) => {
                const anim = {
                    name: param.name,
                    values: []
                }


                const startVal = param.values[0];
                const endVal = param.values[1];

                const deltaX = endVal[0] - startVal[0];
                const deltaY = endVal[1] - startVal[1];

                for (let i = 0; i <= steps; i++)
                {
                    const x = (i/steps * deltaX) + startVal[0];
                    const y = (i/steps * deltaY) + startVal[1];

                    const itCoord = [x,y];

                    anim.values.push(itCoord);
                }

                objAnimation.params.push(anim);
            });

            outList.push(objAnimation);
        });

        this.app.animationCounter = 0;
        this.animations = [ outList ];
    }

    calculateComponents()
    {
        const comps = this.findStartComponents();

        comps.forEach( (component) => {
            // first find the object we're working on :D
            const obj = component.activeObj;

            console.log("COMPONENT: " + component.name);
            const componentNodes = component.elements.nodes;

            componentNodes.FNC.forEach( (node) => {
                const IN = node.elements.handles.L;
                const OUT = node.elements.handles.R;

                const INRefList = [];

                const beforeParams = [];

                IN.forEach( (handle, indx) => {
                    if (handle.line.connection.isConnected)
                    {
                        const connectedParam = handle.line.connection.connectedObj.parameter;

                        // save inputs for effector function
                        INRefList[indx] = connectedParam.value;

                        beforeParams.push(connectedParam);


                        console.log(connectedParam);
                        console.log(obj.properties[connectedParam.name]);

                        // save preview values in parameter and update text in the corresponding node
                        connectedParam.value = obj.properties[connectedParam.name];
                        handle.line.connection.connectedObj.node.updateText();
                    }
                });

                // call FNC
                // main part
                const out = node.effector.fnc(...INRefList);

                // move values to nodes connected to out lines
                for (let i = 0; i < OUT.length; i++)
                {
                    const handle = OUT[i];

                    if (handle.line.connection.isConnected)
                    {
                        const connectedObj = handle.line.connection.connectedObj;

                        connectedObj.parameter.value = out[i];
                        connectedObj.node.updateText();
                    }
                }

                // create list based on what's in out
                const animationList = [
                    {
                        obj: obj,
                        params: []
                    }
                ];

                const paramsOUT = componentNodes.OUT[0].parameters.list;

                console.log(paramsOUT);

                paramsOUT.forEach( (param,indx) => {
                    // find before value for this param
                    let beforeVal;
                    console.log(beforeParams);
                    beforeParams.forEach( (beforeParam) => {
                        
                        if (beforeParam.name == param.name) beforeVal = beforeParam.value;
                    });


                    let paramToAnim = {
                        name: param.name,
                        values:[beforeVal, param.value]
                    }

                    animationList[0].params.push(paramToAnim);
                });

                // produce animation data
                this.calculateAnimation(animationList);
            });
        })

        // first go to the earliest in params
        // start from that point
    }
}