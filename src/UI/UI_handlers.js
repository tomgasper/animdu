import { m3 } from "../utils.js";
import { CustomBuffer } from "../Primitives/CustomBuffer.js";
import { UIObject } from "./UIObject.js";
import { createNewText } from "../Text/textHelper.js";

import { RenderableObject } from "../Primitives/RenderableObject.js";

export function mountUI(scene)
{
    const projectionMat = m3.projection(scene.gl.canvas.clientWidth, scene.gl.canvas.clientHeight);
    const screen_width = scene.gl.canvas.clientWidth;
    const screen_height = scene.gl.canvas.clientHeight;
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


    const UIContainerBuffer = new CustomBuffer(scene.gl, scene.programs[0], customVertsPos);
    const UIContainerBufferInfo = UIContainerBuffer.getInfo();
    
    const UI_Container = new RenderableObject(UIContainerBufferInfo, projectionMat);

    UI_Container.canBeMoved = false;
    UI_Container.properties.highlight = false;
    UI_Container.setColor([0,0.3,0.2,1]);
    UI_Container.properties.originalColor = [0, 0.02, 0.04, 1];

    const txtColor = [1,1,1,1];

    // Install Text
    const txt_1 = createNewText(scene.gl, scene.programs[2], "New Object", 20, scene.fontUI,txtColor);
    txt_1.setPosition([x_offset,screen_height/2 + y_offset]);
    txt_1.canBeMoved = false;
    txt_1.blending = true;
    txt_1.setScale([0.6,0.6]);

    const txt_2 = createNewText(scene.gl, scene.programs[2], "See stats", 20, scene.fontUI,txtColor);
    txt_2.setPosition([x_offset+130, screen_height/2 + y_offset]);
    txt_2.canBeMoved = false;
    txt_2.blending = true;
    txt_2.setScale([0.6,0.6]);

    const txt_3 = createNewText(scene.gl, scene.programs[2], "Reset", 20, scene.fontUI,txtColor);
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
        const someText = createNewText(scene.gl, scene.programs[2], "Dynamic text", 14, scene.fontUI, projectionMat);
        someText.setPosition([0,0]);
        someText.blending = true;
        someText.updateWorldMatrix();
        scene.addObjToScene([someText]);
        console.log("added");
    };

    scene.addObjToScene(objsToAdd);
}