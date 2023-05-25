import { m3 } from "../utils.js";
import { CustomBuffer } from "../Primitives/CustomBuffer.js";
import { createNewText } from "../Text/textHelper.js";

import { UIBuffers } from "./UIBuffers.js"

import { RenderableObject } from "../RenderableObject.js";

const initializeUIBuffers = (app, program) => 
{
    // Set up UI
    const UINodeSize = [130,120];
    const UIBuffersStore = new UIBuffers();
    UIBuffersStore.createUINodeBuffers(app.gl, program, UINodeSize, 0.05);

    const UILayerInfoSize = [300, 50];
    UIBuffersStore.createUILayerBuffers(app.gl, program, UILayerInfoSize);

    // save ref
    app.UIBuffers = UIBuffersStore;
}

export const initUI = (app) =>
{
    initializeUIBuffers(app, app.programs[0]);
    initViewer(app);
}

const initViewer = (app) =>
{
    const projectionMat = m3.projection(app.gl.canvas.clientWidth, app.gl.canvas.clientHeight);
    const screen_width = app.gl.canvas.clientWidth;
    const screen_height = app.gl.canvas.clientHeight;

    const y_offset = screen_height * 0.02;
    const x_offset = screen_width * 0.02;

    // Install Container
    const customVertsPos = [  0, screen_height/2,
                                screen_width, screen_height/2,
                                screen_width, screen_height,
                                
                                screen_width, screen_height,
                                0, screen_height,
                                0, screen_height/2,
                            ];


    const UIContainerBuffer = new CustomBuffer(app.gl, app.programs[0], customVertsPos);
    const UIContainerBufferInfo = UIContainerBuffer.getInfo();
    
    const UI_Container = new RenderableObject(UIContainerBufferInfo, projectionMat);

    UI_Container.canBeMoved = false;
    UI_Container.properties.highlight = false;
    UI_Container.setColor([0,0.3,0.2,1]);
    UI_Container.properties.originalColor = [0, 0.02, 0.04, 1];

    const txtColor = [1,1,1,1];

    // Install Text
    const txt_1 = createNewText(app.gl, app.programs[2], "New Object", 20, app.fontUI,txtColor);
    txt_1.setPosition([x_offset,screen_height/2 + y_offset]);
    txt_1.canBeMoved = false;
    txt_1.blending = true;
    txt_1.setScale([0.6,0.6]);

    const txt_2 = createNewText(app.gl, app.programs[2], "See stats", 20, app.fontUI,txtColor);
    txt_2.setPosition([x_offset+130, screen_height/2 + y_offset]);
    txt_2.canBeMoved = false;
    txt_2.blending = true;
    txt_2.setScale([0.6,0.6]);

    const txt_3 = createNewText(app.gl, app.programs[2], "Reset", 20, app.fontUI,txtColor);
    txt_3.setPosition([x_offset+250, screen_height/2 + y_offset]);
    txt_3.canBeMoved = false;
    txt_3.blending = true;
    txt_3.setScale([0.6,0.6]);

    const objsToAdd = [UI_Container, txt_1,txt_2, txt_3];

    objsToAdd.forEach((obj) => {
        obj.updateWorldMatrix();
    });


    // Manage event hadlers
    txt_1.handlers.onClick = () => {
        const someText = createNewText(app.gl, app.programs[2], "Dynamic text", 14, app.fontUI, projectionMat);
        someText.setPosition([0,0]);
        someText.blending = true;
        someText.updateWorldMatrix();
        app.addObjToScene([someText]);
        console.log("added");
    };

    app.addObjToScene(objsToAdd);
}