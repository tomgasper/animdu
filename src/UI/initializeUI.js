import { getProjectionMat, m3 } from "../utils.js";
import { CustomBuffer } from "../Primitives/CustomBuffer.js";
import { createNewText } from "../Text/textHelper.js";

import { UIBuffers } from "./UIBuffers.js"

import { RenderableObject } from "../RenderableObject.js";

import { TextFont } from "../Text/TextFont.js";
import { roboto_bold_font } from "../fonts/roboto-bold.js";

export const initTopBar = (app, UI) =>
{
    const projectionMat = getProjectionMat(app.gl);
    const screen_width = app.gl.canvas.clientWidth;
    const screen_height = app.gl.canvas.clientHeight;

    const barHeight = screen_height * 0.03;

    const x_offset = screen_width * 0.02;
    const y_offset = screen_height * 0.02;

    const x_txt_distance = screen_width * 0.03;

    const customVertsPos = [ 0, 0,
                             screen_width, 0,
                             screen_width, barHeight,
                            
                            screen_width, barHeight,
                            0, barHeight,
                            0, 0
                            ];

    const UITopBarBuffer = new CustomBuffer(app.gl, app.programs[0], customVertsPos);
    const UITopBarBufferInfo = UITopBarBuffer.getInfo();

    const UITopBar = new RenderableObject(UITopBarBufferInfo, projectionMat);


    UITopBar.setCanBeMoved(false);
    UITopBar.setCanBeHighlighted(false);
    UITopBar.setColor([0,0.3,0.2,1]);
    UITopBar.setOriginalColor([0, 0.02, 0.04, 1]);

    const txtColor = [1,1,1,1];

    // First text from left

    const txt_1 = createNewText(app.gl, app.programs[2], "File", 9, UI.font, txtColor);
    // Retrive txtHeight from newly created buffer
    const txtHeight = txt_1.txtBuffer.str.rect[3];
    txt_1.setPosition([x_offset, barHeight/2-txtHeight/2]);
    txt_1.setCanBeMoved(false);
    txt_1.setBlending(true);

    txt_1.setParent(UITopBar);


    // Second text from left

    const txt_2 = createNewText(app.gl, app.programs[2], "Edit", 9, UI.font, txtColor);
    const txt2Height = txt_2.txtBuffer.str.rect[3];
    txt_2.setPosition([x_offset + x_txt_distance, barHeight/2-txt2Height/2]);
    txt_2.setCanBeMoved(false);
    txt_2.setBlending(true);
    txt_2.setParent(UITopBar);


    // Third text from left

    const txt_3 = createNewText(app.gl, app.programs[2], "View", 9, UI.font, txtColor);
    const txt3Height = txt_3.txtBuffer.str.rect[3];
    txt_3.setPosition([x_offset + x_txt_distance * 2, barHeight/2-txt2Height/2]);
    txt_3.setCanBeMoved(false);
    txt_3.setBlending(true);
    txt_3.setParent(UITopBar);


    UITopBar.updateWorldMatrix();

    const objsToAdd = [UITopBar, txt_1,txt_2, txt_3];

    return objsToAdd;
}

export const initParamsPanel = (app, UI) =>
{
    const projectionMat = getProjectionMat(app.gl);
    const screen_width = app.gl.canvas.clientWidth;
    const screen_height = app.gl.canvas.clientHeight;

    const barHeight = UI.topBarHeight;

    const x_offset = screen_width * 0.02;
    const y_offset = screen_height * 0.02;

    const panelWidth = screen_width * 0.2;

    const x_txt_distance = screen_width * 0.03;

    const customVertsPos = [ 0, 0,
                            panelWidth, 0,
                            panelWidth, UI.viewerStartY-barHeight,
                            
                            panelWidth, UI.viewerStartY-barHeight,
                            0, UI.viewerStartY-barHeight,
                            0, 0
                            ];

    const UIParamsPanelBuffer = new CustomBuffer(app.gl, app.programs[0], customVertsPos);
    const UIParamsPanelInfo = UIParamsPanelBuffer.getInfo();

    const UIParamsPanel = new RenderableObject(UIParamsPanelInfo, projectionMat);


    UIParamsPanel.setPosition([0,barHeight]);
    UIParamsPanel.setCanBeMoved(false);
    UIParamsPanel.setCanBeHighlighted(false);
    UIParamsPanel.setColor([0,0.3,0.2,1]);
    UIParamsPanel.setOriginalColor([0.5,0.5,0.5,1]);

    const txtColor = [0,0,0,1];

    // First text from left

    const txt_1 = createNewText(app.gl, app.programs[2], "File", 9, UI.font, txtColor);
    // Retrive txtHeight from newly created buffer
    const txtHeight = txt_1.txtBuffer.str.rect[3];
    txt_1.setPosition([x_offset, barHeight/2-txtHeight/2]);
    txt_1.setCanBeMoved(false);
    txt_1.setBlending(true);

    txt_1.setParent(UIParamsPanel);


    UIParamsPanel.updateWorldMatrix();

    const objsToAdd = [UIParamsPanel, txt_1];

    UI.addObj(objsToAdd);
}

export const initObjectsPanel = (app, UI) =>
{
    const projectionMat = getProjectionMat(app.gl);
    const screen_width = app.gl.canvas.clientWidth;
    const screen_height = app.gl.canvas.clientHeight;

    const barHeight = UI.topBarHeight;

    const x_offset = screen_width * 0.02;
    const y_offset = screen_height * 0.02;

    const panelWidth = screen_width * 0.2;

    const x_txt_distance = screen_width * 0.03;

    const customVertsPos = [ 0, 0,
                            panelWidth, 0,
                            panelWidth, UI.viewerStartY-barHeight,
                            
                            panelWidth, UI.viewerStartY-barHeight,
                            0, UI.viewerStartY-barHeight,
                            0, 0
        ];

    const UIParamsPanelBuffer = new CustomBuffer(app.gl, app.programs[0], customVertsPos);
    const UIParamsPanelInfo = UIParamsPanelBuffer.getInfo();

    const UIParamsPanel = new RenderableObject(UIParamsPanelInfo, projectionMat);


    // offset to the right and down
    UIParamsPanel.setPosition([screen_width-panelWidth,barHeight]);

    UIParamsPanel.setCanBeMoved(false);
    UIParamsPanel.setCanBeHighlighted(false);
    UIParamsPanel.setColor([0,0.3,0.2,1]);
    UIParamsPanel.setOriginalColor([0.5,0.5,0.5,1]);

    const txtColor = [0,0,0,1];

    // First text from left

    const txt_1 = createNewText(app.gl, app.programs[2], "Object 1", 9, UI.font, txtColor);
    // Retrive txtHeight from newly created buffer
    const txtHeight = txt_1.txtBuffer.str.rect[3];
    txt_1.setPosition([x_offset, barHeight/2-txtHeight/2]);
    txt_1.setCanBeMoved(false);
    txt_1.setBlending(true);

    txt_1.setParent(UIParamsPanel);


    UIParamsPanel.updateWorldMatrix();

    const objsToAdd = [UIParamsPanel, txt_1];

    UI.addObj(objsToAdd);
}

export const initViewer = (app, UI) =>
{
    const projectionMat = m3.projection(app.gl.canvas.clientWidth, app.gl.canvas.clientHeight);
    const screen_width = app.gl.canvas.clientWidth;
    const screen_height = app.gl.canvas.clientHeight;

    console.log(screen_height);

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
    const txt_1 = createNewText(app.gl, app.programs[2], "New Object", 20, UI.font,txtColor);
    txt_1.setPosition([x_offset,screen_height/2 + y_offset]);
    txt_1.canBeMoved = false;
    txt_1.blending = true;
    txt_1.setScale([0.6,0.6]);

    const txt_2 = createNewText(app.gl, app.programs[2], "See stats", 20, UI.font,txtColor);
    txt_2.setPosition([x_offset+130, screen_height/2 + y_offset]);
    txt_2.canBeMoved = false;
    txt_2.blending = true;
    txt_2.setScale([0.6,0.6]);

    const txt_3 = createNewText(app.gl, app.programs[2], "Reset", 20, UI.font,txtColor);
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
        const someText = createNewText(app.gl, app.programs[2], "Dynamic text", 14, UI.font, projectionMat);
        someText.setPosition([0,0]);
        someText.blending = true;
        someText.updateWorldMatrix();
        app.activeComp.addObj(someText);
        console.log("added");
    };

    return objsToAdd;
}

export const setUpMainFont = (app, UI) =>
    {
     // Install font
     const fontSettings = {
        textureSrc: "./src/fonts/roboto-bold.png",
        texResolution: [1024,1024],
        color: [1,1,1.3,1],
        subpixel: 1.0,
        decoder: roboto_bold_font
    };
    const robotoBoldFont = new TextFont(app.gl, fontSettings, app.gl.LUMINANCE);
    UI.font = robotoBoldFont;

    console.log(UI);
    }