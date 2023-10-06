import { RenderableObject } from "../RenderableObject.js";

import { UINode } from "./NodeEditor/UINode.js";
import { ObjNode } from "./NodeEditor/ObjNode.js";
import { FunctionNode } from "./NodeEditor/FunctionNode.js";
import { ParamNode } from "./NodeEditor/ParamNode.js";
import { UINodeParamList } from "./NodeEditor/UINodeParamList.js";

import { UIBuffers } from "./UIBuffers.js";

import { setUpMainFont } from "./initializeUI.js";

import { UISceneViewport } from "./UISceneViewport.js";
import { UINodeEditor } from "./UINodeEditor.js";

import { percToFraction } from "../utils.js";

import { Camera } from "../Composition/Camera.js";

export class UI
{
    app;
    
    panels = {
        params: undefined,
        layers: undefined,
    }

    viewer = {
        objects: [],
    }

    viewport = {
        objects: []
    }

    topBar = {
        objects: [],
    }

    nodes = {
        objects: [],
    }

    buttons =
    {
        objects: []
    }

    leftPanelWidth = 300;
    rightPanelWidth = 300;
    topBarHeight;
    viewerStartY;

    style = {
        general:
        {
            mainColour: "3E65C8",
            secondaryColour: "000000",
            text:
            {
                regular:
                {
                    font: undefined,
                    fontSize: 10,
                },
                bold:
                {
                    font: undefined,
                    fontSize: 10,
                }
            },
        },
        nodes:
        {
            general:
            {
                heading:
                    {
                        text:
                        {
                            font: undefined,
                            size: 12,
                            colour: "FFFFFF"
                        }
                    },
                    body:
                    {
                        text:
                        {
                            font: undefined,
                            size: 10,
                            colour: "FFFFFF"
                        }
                    },
                    container:
                    {
                        size: [150,200],
                        colour: "3E65C8",
                    },
                    textInput:
                    {
                        text: {
                            font: undefined,
                            size: 9,
                            colour: "FFFFFF"
                        },
                        container:
                        {
                            colour: "253E7F"
                        }
                    },
                    line:
                    {
                        colour: "D7E2FF"
                    }
            },
            component:
            {
                container:
                {
                    colour: "3E65C8",
                },
                hideButton:
                {
                    colour: "253E7F"
                },
                line:
                {
                    colour: "3E65C8"
                }
            },
            params:
            {
                container:
                {
                    colour: "D7E2FF"
                },
                text:
                {
                    colour: "000000"
                }
            },
            fnc:
            {
                container:
                {
                    colour: "D7E2FF"
                },
                text:
                {
                    colour: "000000"
                }
            }
        },
        nodeViewer:
        {
            general:
            {

            },
            size:
            {
                // in %
                height: "50%",
                width: "100%"
            },
            container:
            {
                colour: "E2E2E2"
            }
        },
        viewport:
        {
            size:
            {
                height: "50%",
                width: "50%"
            }
        }
    }

    UIBuffers;
    
    constructor(app)
    {
        // Save ref to the app
        this.app = app;

        this.start(app);
    }

    start(app)
    {
        this.initUI(app, this);
    }

    initUI = (app) =>
    {
        this.initializeUIBuffers(app,app.programs);
        const [ mainFont, mainBoldFont ] = setUpMainFont(app,this);

        this.style.general.text.regular.font = mainFont;
        this.style.general.text.bold.font = mainBoldFont;

        this.style.nodes.general.heading.text.font = mainBoldFont;
        this.style.nodes.general.body.text.font = mainFont;

        this.style.nodes.general.textInput.text.font = mainFont;

        // Create scene viewport
        const sceneViewportSize = [this.app.gl.canvas.clientWidth, this.app.gl.canvas.clientHeight];
        this.viewport = new UISceneViewport(this.app, sceneViewportSize, [0.6,0.6,0.6,1]);

        // Create node space viewport
        const editorSpaceDims = [0, this.app.gl.canvas.clientWidth,
                            this.app.gl.canvas.clientHeight/2, this.app.gl.canvas.clientHeight];

        // const [ nodeSpaceContainerBuffer, nodeSpaceContainerVerts ] = this.createContainer(viewerDims);
        this.viewer = new UINodeEditor(this.app, this, editorSpaceDims);

        // add camera to the viewer
        this.viewer.camera = new Camera();
    }

    initializeUIBuffers = (app, programs) => 
    {
        // Set up UI
        const UIBuffersStore = new UIBuffers();

        const UINodeSize = [130,120];
        UIBuffersStore.createUINodeBuffers(app.gl, programs, UINodeSize, 0.05);

        const ObjNodeSize = [130,100];
        UIBuffersStore.createObjNodeBuffers(app.gl, programs, ObjNodeSize, 0.2);

        // save ref
        this.UIBuffers = UIBuffersStore;
    }

    addNode(paramList, pos = [0,0])
    {
        let params = paramList;

        if ( paramList instanceof UINodeParamList)
        {
            params = paramList;
        }
        else if ( typeof paramList == "string" ) {
            params = new UINodeParamList(paramList);
        } else throw Error ("Incorrect input!");

        const node = new UINode(this.app, params);
        node.initialize();

        node.setPosition(pos);

        this.addObj(node.getObjsToRender(), ["nodes"]);

        return node;
    }

    resize()
    {
        const screenSize = [this.app.gl.canvas.clientWidth,this.app.gl.canvas.clientHeight];
        const nodeSpaceSize = [ percToFraction(this.style.nodeViewer.size.width)*screenSize[0],
                                percToFraction(this.style.nodeViewer.size.height)*screenSize[1]];

        const viewerDims = [0, nodeSpaceSize[0],
            nodeSpaceSize[1], screenSize[1]];
        
        this.viewer.updateContainer(viewerDims);

        const viewportSize = [percToFraction(this.style.viewport.size.width)*screenSize[0],
                                percToFraction(this.style.viewport.size.height)*screenSize[1]];
        
        const viewportOffsetX = (screenSize[0] - viewportSize[0])/2;
        const viewportDims = [viewportOffsetX, screenSize[0] - viewportSize[0]/2,
        0, viewportSize[1]];
        this.viewport.updateContainer(viewportDims);

        
        const cameraZoom = this.app.activeComp.camera.zoom;
        // const centre = [-(viewportOffsetX + viewportSize[0]/2)*(1/cameraZoom),(-viewportSize[1]/2)*(1/cameraZoom)];
        // this.app.activeComp.camera.setPosition([ ,  ] );
    }

    addObjNode(obj)
    {
        const containerBuffer = this.UIBuffers.UINode.container.buffer;
        const newNode = new ObjNode(this.app, containerBuffer, obj);
        newNode.setParent(this.viewer);

        return newNode;
    }

    addObj(obj, dir)
    {
        let dest = this[dir[0]];

        if (dir.length > 1)
        {
            for (let i = 1; i < dir.length; i++)
            {
                if (!dest[dir[i]]) throw new Error("Incorrect render location!");

                dest = dest[dir[i]];
            }
        }

        // handle array of objects
        if (obj.length && obj.length >= 1)
        {
            obj.forEach((obj) => {
                if (obj && obj instanceof RenderableObject) dest.objects.push(obj);
                else if( !(obj instanceof RenderableObject) ) throw new Error("Incorrect object type for Renderer");
            });
        } else if (obj instanceof RenderableObject) dest.objects.push(obj);
    }

    removeObjs(objs, dir)
    {
        let dest = this[dir[0]];

        if (dir.length > 1)
        {
            for (let i = 1; i < dir.length; i++)
            {
                dest = dest[dir[i]];
            }
        }

        let map = {};

        for ( let i = 0; i < objs.length; i++)
        {
            map[objs[i].id] = 1;
        }

        dest.objects = dest.objects.filter( obj => { return !(obj.id in map) });
    }

    getObjs()
    {
        return this.objects;
    }

    updateObjectsPanel(comp)
    {

    }
}