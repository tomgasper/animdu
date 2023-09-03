import { m3 } from "../utils.js";
import { RenderableObject } from "../RenderableObject.js";
import { renderObject } from "../utils.js";

// Draw functions
export const drawObjects = (scene, objsToDraw, objsArrIndx, programInfo = undefined) =>
    {
        // to do
        let program;
        const projection = m3.projection(scene.gl.canvas.clientWidth, scene.gl.canvas.clientHeight);

        if (typeof programInfo !== "undefined" ) // this is drawing for picking pass, with specified shader
        {
            program = programInfo;
            scene.gl.useProgram(program.program);

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

                // obj.updateTransform();

                
                if (!obj.parent) obj.updateWorldMatrix();
                
                obj.setID(u_id);
                obj.setProjectionAndCalcFinalTransform(projection);

                renderObject(scene.gl, obj, program);

                // Reset color
                obj.setColor(obj.properties.originalColor);
        })} else {  // Use object's shader when shader hasn't been specified
            objsToDraw.forEach((obj, ii) => {
                let objProgram = obj.renderInfo.programInfo;

                // Switch shader if the cached one doesn't work
                if (objProgram !== program)
                {
                    scene.gl.useProgram(objProgram.program);
                    program = objProgram;
                }

                if (obj.properties.blending === true && !scene.gl.isEnabled(scene.gl.BLEND) )
                {
                    scene.gl.enable(scene.gl.BLEND);
                }

                //obj.setProjection(projection);

                renderObject(scene.gl, obj, program);

                // Disable blending
                if (scene.gl.isEnabled(scene.gl.BLEND) )
                {
                    scene.gl.disable(scene.gl.BLEND);
                }
        })}
    }

const drawInMask = (appRef, objsArrIndx, program) =>
{
    appRef.gl.enable(appRef.gl.STENCIL_TEST);
    appRef.gl.clear(appRef.gl.STENCIL_BUFFER_BIT);
    appRef.gl.stencilFunc(appRef.gl.ALWAYS,1,0xFF);
    appRef.gl.stencilOp(appRef.gl.KEEP, appRef.gl.KEEP, appRef.gl.REPLACE);

    drawObjects(appRef, appRef.objsToDraw[objsArrIndx].mask, objsArrIndx, program);

    appRef.gl.stencilFunc(appRef.gl.EQUAL, 1, 0xFF);
    appRef.gl.stencilOp(appRef.gl.KEEP, appRef.gl.KEEP, appRef.gl.KEEP);
    drawObjects(appRef, appRef.objsToDraw[objsArrIndx].objs, objsArrIndx, program);

    appRef.gl.disable(appRef.gl.STENCIL_TEST);
}

const drawWithoutMask = (appRef,objsArrIndx, program = undefined) =>
{
    drawObjects(appRef, appRef.objsToDraw[i].objs, objsArrIndx, program);
}

export const drawPass = (appRef, objsToDraw, program, indx = 0) =>
{
    // indx complication is needed for correct retrieval of object under mouse coursor
    for (let i = 0; i < objsToDraw.length; i++)
    {
        if (objsToDraw[i].mask.length > 0)
        {
            drawInMask(appRef,indx, program);
        }
        else
        {
            drawWithoutMask(appRef, indx, program);
        }
        indx++;
    }
}