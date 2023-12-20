import { getProjectionMat, m3 } from '../utils';
import { RenderableObject } from '../RenderableObject';
import { renderObject } from '../utils';
import { TextObject } from '../Text/TextObject';

import { calcViewProjMat } from '../utils';
import { UISceneViewport } from '../UI/UISceneViewport';

import { UINodeEditor } from '../UI/UINodeEditor';

// Draw functions
export const drawObjects = (app, objsToDraw, objsArrIndx, programInfo = undefined, camera) =>
    {
        // to do
        let program;
        const viewProjection = calcViewProjMat(app.gl.canvas.clientWidth, app.gl.canvas.clientHeight, camera);

        if (typeof programInfo !== "undefined" ) // this is drawing for picking pass, with specified shader
        {
            program = programInfo;
            app.gl.useProgram(program.program);

            // set projection based on canvas dimensions
            objsToDraw.forEach((obj, i) => {
                if (!(obj instanceof RenderableObject)) throw Error("Incorrect object in draw loop!" + obj);
                // (!) Notice that we are setting id offset by 1
                const ii = i +1 ;

                // if object is pickable then assign it a u_id
                const u_id = [
                        ((objsArrIndx >>  0) & 0xFF) / 0xFF,
                        ((ii >> 0 ) & 0xFF) / 0xFF,
                        ((ii >> 8 ) & 0xFF) / 0xFF,
                        ((ii >> 16) & 0xFF) / 0xFF
                    ];

                
                if (obj.properties.resolution) obj.properties.resolution = [app.gl.canvas.width, app.gl.canvas.height];

                if (!obj.parent) obj.updateWorldMatrix();
                
                obj.setID(u_id);

                // set correct projection
                // we don't want the camera to affect viewport bg or node space bg so we ignore view transform and just set projection
                if (obj instanceof UINodeEditor || obj instanceof UISceneViewport ) obj.setProjectionAndCalcFinalTransform(getProjectionMat(app.gl));
                else obj.setProjectionAndCalcFinalTransform(viewProjection);

                renderObject(app.gl, obj, program);

                // Reset color
                obj.setColor(obj.properties.originalColor);
        })} else {  // Use object's shader when shader hasn't been specified
            objsToDraw.forEach((obj, ii) => {
                // Sometimes we will be erasing object during "EventHandler" phase
                // this check is here to ignore mid-frame deleted object
                if (!obj || !obj.buffer) return;

                let objProgram = obj.buffer.renderInfo.programInfo;

                // Switch shader if the cached one doesn't work
                if (objProgram !== program)
                {
                    app.gl.useProgram(objProgram.program);
                    program = objProgram;
                }

                let isBlendingEnabled = app.settings.render.blendingEnabled; 
                if (obj.properties.blending === true )
                {
                    if (!isBlendingEnabled) isBlendingEnabled = app.setBlendingEnabled(true);

                    if (obj instanceof TextObject)
                    {
                        const font = obj.txtBuffer.font;
                        const fontColour = obj.properties.font_color;

                        if ( font.subpixel === 1.0 ) {
                            // Subpixel antialiasing.
                            // Method proposed by Radek Dutkiewicz @oomek
                            // Text color goes to constant blend factor and 
                            // triplet alpha comes from the fragment shader output
                    
                            app.gl.blendColor( fontColour[0], fontColour[1], fontColour[2], 1 );
                            app.gl.blendEquation( app.gl.FUNC_ADD );
                            app.gl.blendFuncSeparate( app.gl.CONSTANT_COLOR, app.gl.ONE_MINUS_SRC_COLOR, app.gl.ZERO, app.gl.ONE );
                            // app.gl.blendFunc( app.gl.CONSTANT_COLOR, app.gl.ONE_MINUS_SRC_COLOR );
                        } else {
                            // Greyscale antialising
                            app.gl.blendEquation( app.gl.FUNC_ADD );
                            app.gl.blendFunc( app.gl.SRC_ALPHA, app.gl.ONE_MINUS_SRC_ALPHA );
                        }
                    } else {
                        app.gl.blendFunc(app.gl.SRC_ALPHA, app.gl.ONE_MINUS_SRC_ALPHA);
                    }
                }

                renderObject(app.gl, obj, program);

                // Disable blending
                if ( isBlendingEnabled )
                {
                    app.setBlendingEnabled(false);
                }
        })}
    }

const drawInMask = (appRef, objsArrIndx, program,camera) =>
{
    const objsToDraw = appRef.sceneManager.getObjsToDraw();

    appRef.gl.clear(appRef.gl.STENCIL_BUFFER_BIT);
    appRef.gl.enable(appRef.gl.STENCIL_TEST);
    
    appRef.gl.stencilFunc(appRef.gl.ALWAYS,1,0xFF);
    appRef.gl.stencilOp(appRef.gl.REPLACE, appRef.gl.REPLACE, appRef.gl.REPLACE);
    drawObjects(appRef, objsToDraw[objsArrIndx].mask, objsArrIndx, program, camera);
    
    // appRef.gl.stencilMask(0xFF);
    appRef.gl.stencilFunc(appRef.gl.EQUAL, 1, 0xFF);
    appRef.gl.stencilOp(appRef.gl.KEEP, appRef.gl.KEEP, appRef.gl.KEEP);
    drawObjects(appRef, objsToDraw[objsArrIndx].objs, objsArrIndx, program, camera);
    appRef.gl.disable(appRef.gl.STENCIL_TEST);
}

const drawWithoutMask = (appRef,objsArrIndx, program = undefined, camera) =>
{
    drawObjects(appRef, appRef.objsToDraw[objsArrIndx].objs, objsArrIndx, program, camera);
}

export const drawPass = (renderSettings) =>
{
    let { appRef, objsToDraw, program, listIndx, camera } = renderSettings;

    // indx complication is needed for correct retrieval of object under mouse cursor
    for (let i = 0; i < objsToDraw.length; i++)
    {
        if (objsToDraw[i].mask.length > 0)
        {
            drawInMask(appRef,listIndx, program, camera);
        }
        else
        {
            drawWithoutMask(appRef, listIndx, program, camera);
        }
        listIndx++;
    }
}