import { RenderableObject } from "../RenderableObject.js";

import { UINode } from "./Node/UINode.js";
import { ObjNode } from "./Node/ObjNode.js";
import { FunctionNode } from "./Node/FunctionNode.js";
import { ParamNode } from "./Node/ParamNode.js";
import { UINodeParamList } from "./Node/UINodeParamList.js";

import { UILayersPanel } from "./Panels/UILayersPanel.js";

import { UIBuffers } from "./UIBuffers.js";

import { setUpMainFont } from "./initializeUI.js";

import { UIViewport } from "./UIViewport.js";
import { UIViewer } from "./UIViewer.js";

import { CustomBuffer } from "../Primitives/CustomBuffer.js";

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
                text: {
                    heading:
                    {
                        font: undefined,
                        size: 12,
                        colour: "FFFFFF"
                    },
                    body:
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
                }
            },
            component:
            {
                container:
                {
                    colour: "3E65C8",
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
                height: 30,
                width: 100
            },
            container:
            {
                colour: "E2E2E2"
            }
        },
    }

    UIBuffers;
    
    constructor(app)
    {
        // Save ref to the app
        this.app = app;

        // set dimensions of different panels
        this.topBarHeight = this.app.gl.canvas.clientHeight * 0.03;
        // this.viewerStartY = this.app.gl.canvas.clientHeight/2;

        this.start(app);
    }

    start(app)
    {
        this.initUI(app, this);
    }

    createViewport(width, height)
    {
        const data = [
            0,0,
            width,0,
            width, height,

            width,height,
            0, height,
            0, 0
        ];

        // create new objects that garbage collector will hopefully delete when it's time to go
        const customBuffer = new CustomBuffer(this.app.gl, this.app.programs[0], data);
        // const viewport = new RenderableObject(customBuffer.getInfo());

        return customBuffer.getInfo();
    }

    createContainer(dims)
    {
        const [ left, right, top, bottom ] = dims;
            // Install Container
        const customVertsPos = [  left, top,
        right, top,
        right, bottom,

        right, bottom,
        left, bottom,
        left, top
        ];


        const customRectBuffer = new CustomBuffer(this.app.gl, this.app.programs[0], customVertsPos);
        const customRectBufferInfo = customRectBuffer.getInfo();

        return customRectBufferInfo;
    }

    initUI = (app) =>
    {
        this.initializeUIBuffers(app,app.programs[0]);
        const [ mainFont, mainBoldFont ] = setUpMainFont(app,this);

        this.style.general.text.regular.font = mainFont;
        this.style.general.text.bold.font = mainBoldFont;

        this.style.nodes.general.text.heading.font = mainBoldFont;
        this.style.nodes.general.text.body.font = mainFont;

        this.style.nodes.general.textInput.text.font = mainFont;

        // Create scene viewport
        this.viewport = new UIViewport(this.app, this.createViewport(800,400), [800,400], [0.6,0.6,0.6,1]);

        // Create node space viewport
        const viewerDims = [0, this.app.gl.canvas.clientWidth,
                            this.app.gl.canvas.clientHeight/2, this.app.gl.canvas.clientHeight];
        this.viewer = new UIViewer(this.app, this, this.createContainer(viewerDims), "UIViewer", viewerDims);
    }

    initializeUIBuffers = (app, program) => 
    {
        // Set up UI
        const UIBuffersStore = new UIBuffers();

        const UINodeSize = [130,120];
        UIBuffersStore.createUINodeBuffers(app.gl, program, UINodeSize, 0.05);

        const ObjNodeSize = [130,100];
        UIBuffersStore.createObjNodeBuffers(app.gl, program, ObjNodeSize, 0.2);

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

    addObjNode(obj, params)
    {
        const containerBuffer = this.UIBuffers.UINode.container.buffer.getInfo();
        const newNode = new ObjNode(this.app, containerBuffer, obj, params);
        newNode.initialize();
        newNode.setParent(this.viewer);

        return newNode;
    }

    addFunctionNode(effectorFnc)
    {
        const newNode = new FunctionNode(this.app, effectorFnc);
        newNode.initialize();

        this.addObj(newNode.getObjsToRender(), ["nodes"]);
        return newNode;
    }

    addParamNode(type, params)
    {
        const newNode = new ParamNode(this.app, type, params);
        newNode.initialize();

        this.addObj(newNode.getObjsToRender(), ["nodes"]);
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

    initLayersPanel(app)
    {
        this.panels.layers = new UILayersPanel(app, this, this.UIBuffers);
        this.panels.layers.pushObjsToRenderer();
    }
}