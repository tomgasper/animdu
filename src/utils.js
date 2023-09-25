import { RenderableObject } from "./RenderableObject.js";

export function resizeCanvasToDisplaySize(originalRes, canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;

    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;

      canvas.style.width = width;
      canvas.style.height = height;
      return true;
    }
    return false;
  }

function setUniforms(gl, programInfo, properties)
{
    Object.keys(programInfo.uniforms).forEach((property, i) =>{
        // Only assisgn values to shaders that have the given property
        if ( Object.hasOwn(properties, property))
        {
            const uniform = programInfo.uniforms[property];
            // console.log(properties);
            switch(uniform.type)
            {
                case "1i":
                    gl.uniform1i(uniform.location, properties[property]);
                    break;
                case "2fv":
                    gl.uniform2fv(uniform.location, properties[property]);
                    break;
                case "1f":
                    gl.uniform1f(uniform.location, properties[property]);
                    break;
                case "4fv":
                    gl.uniform4fv(uniform.location, properties[property]);
                    break;
                case "m3fv":
                    gl.uniformMatrix3fv(uniform.location, false, properties[property]);
                    break;
                default:
                    console.log("Unrecognized type!");
            }
        }
    })
}

export const findNodesOfType = (container, type) =>
{
    const listOfNodes = [];

    function traverseNodes(listOfNodes, parent, type)
    {
        if (!parent) return;
        parent.children.forEach( (child) => {
            if (child instanceof type )
            { 
                listOfNodes.push(child);
                return;
            }

            traverseNodes(listOfNodes, child, type);
        })
    }

    traverseNodes(listOfNodes, container, type);

    return listOfNodes;
}

export function prepareForRender(gl)
    {
        // Conver from clip space to pixels
        gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

export function getProjectionMat(gl)
{
    if (!gl || !gl.canvas) throw Error("Invalid gl/canvas object");

    return m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
}



export function getClipSpaceMousePosition(app, e, offset) {
    // get canvas relative css position
    const rect = app.gl.canvas.getBoundingClientRect();
    const cssX = e.clientX - offset.x/2 - rect.left;
    const cssY = e.clientY - offset.y/2 - rect.top;
    
    // get normalized 0 to 1 position across and down canvas
    const normalizedX = (cssX) / app.gl.canvas.clientWidth;
    const normalizedY = (cssY) / app.gl.canvas.clientHeight;
  
    // convert to clip space
    const clipX = normalizedX *  2 - 1;
    const clipY = normalizedY * -2 + 1;
    
    return [clipX, clipY];
  }

// render generic object
export function renderObject(gl, obj, program)
{
    // binding buffer not needed after creating vertex array and bninding it to the vertex buffer
    if (!(obj instanceof RenderableObject)) throw Error("Object is not renderable!");

    gl.bindVertexArray(obj.renderInfo.vertexArrInfo.VAO);
    setUniforms(gl, program, obj.properties);
    
     // Bind texture if there's any
     if (obj.renderInfo.drawInfo.texture)
     {
         gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, obj.renderInfo.drawInfo.texture);
     }

    obj.renderInfo.drawInfo.drawCall();

    gl.bindVertexArray(null);
}

export function computeTransform(translation =[0,0],angle = 0, scale = [1,1], origin = [0,0])
{
    // Note that the order of the matrix operations is reversed
    // The transformation described by projetionMatrix is applied as the last one
    // Move origin is the first transformation
    let m = m3.translate(m3.identity(), translation[0], translation[1]);
    m = m3.rotate(m, angle);
    m = m3.scale(m, scale[0], scale[1]);
    // move origin
    m = m3.translate(m, origin[0], origin[1]);

    return m;
}

export const m3 = {
    identity: function(){
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },
    translation: function(tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1
        ];
    },

    rotation: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ];
    },

    scaling: function(sx, sy) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1
        ];
    },
    projection: function(width, height) {
        // This matrix flips the Y axis so that 0 is at the top
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];
    },
    translate: function(m, tx,ty) {
        return m3.multiply(m, m3.translation(tx,ty));
    },
    rotate: function(m, angle) {
        return m3.multiply(m, m3.rotation(angle));
    },
    scale: function(m, sx, sy) {
        return m3.multiply(m, m3.scaling(sx,sy));
    },
    multiply: function(a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];

        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];

        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];

        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];

        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];

        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
     
        return [
          b00 * a00 + b01 * a10 + b02 * a20,
          b00 * a01 + b01 * a11 + b02 * a21,
          b00 * a02 + b01 * a12 + b02 * a22,
          b10 * a00 + b11 * a10 + b12 * a20,
          b10 * a01 + b11 * a11 + b12 * a21,
          b10 * a02 + b11 * a12 + b12 * a22,
          b20 * a00 + b21 * a10 + b22 * a20,
          b20 * a01 + b21 * a11 + b22 * a21,
          b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
    multiplyVector: function(a, v)
    {
        // a = mat, v = vec

        let b;
        
        if (v.length == 2) b = [v[0], v[1], 1];
        else b = v;

        let out = [0,0,0];

        out[0] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        out[1] = a[3] * b[0] + a[4] * b[1] + a[5] * b[2];
        out[2] = a[6] * b[0] + a[7] * b[1] + a[8] * b[2];

        return out;
    },
    transpose: function(a)
    {
        let t = [0,0,0,0,0,0,0,0,0];
        t[0] = a[0];
        t[1] = a[3];
        t[2] = a[6];

        t[3] = a[1];
        t[4] = a[4]; 
        t[5] = a[7];

        t[6] = a[2];
        t[7] = a[5];
        t[8] = a[8];

        return t;

    },
    multiplyInPlace: function(out, a, b)
    {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];

        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];

        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];

        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];

        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];

        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
     
        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;
        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;
        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        ;
    },
    inverse: function(a)
    {
        // computes the inverse of a matrix m

        const det = a[0]*((a[4] * a[8]) - (a[5] * a[7])) - a[1]*((a[3]*a[8]) -(a[5]*a[6])) + a[2]*((a[3]*a[7]) - (a[4]*a[6]));
        const detInv = 1 / det;

        const a_T = this.transpose(a);

        const mInv = [0,0,0,0,0,0,0,0,0];

        mInv[0] = (a_T[4]*a_T[8] - a_T[7]*a_T[5])*detInv;
        mInv[1] = -(a_T[3]*a_T[8] - a_T[6]*a_T[5])*detInv;
        mInv[2] = (a_T[3]*a_T[7] - a_T[6]*a_T[4])*detInv;

        mInv[3] = -(a_T[1]*a_T[8] - a_T[7]*a_T[2])*detInv;
        mInv[4] = (a_T[0]*a_T[8] - a_T[6]*a_T[2])*detInv;
        mInv[5] = -(a_T[0]*a_T[7] - a_T[6]*a_T[1])*detInv;

        mInv[6] = (a_T[1]*a_T[5] - a_T[4]*a_T[2])*detInv;
        mInv[7] = -(a_T[0]*a_T[5] - a_T[3]*a_T[2])*detInv;
        mInv[8] = (a_T[0]*a_T[4] - a_T[3]*a_T[1])*detInv;

        return mInv;
    },
    transformPoint: function (m, v) {
        var v0 = v[0];
        var v1 = v[1];
        var d = v0 * m[0 * 3 + 2] + v1 * m[1 * 3 + 2] + m[2 * 3 + 2];
        return [
          (v0 * m[0 * 3 + 0] + v1 * m[1 * 3 + 0] + m[2 * 3 + 0]) / d,
          (v0 * m[0 * 3 + 1] + v1 * m[1 * 3 + 1] + m[2 * 3 + 1]) / d,
        ];
    },
    copy: function (a,b) {
        a[0] = b[0];
        a[1] = b[1];
        a[2] = b[2];
        a[3] = b[3];
        a[4] = b[4];
        a[5] = b[5];
        a[6] = b[6];
        a[7] = b[7];
        a[8] = b[8];
    }
};

const checkIfMatrix = (mat) => {
    if ( mat.length !== 9 || !Array.isArray(mat) ) return false;
    
    return true;
}

export const transformToParentSpace = (parent, vecArr, unscale = true, cameraMat) =>
    {
        let invMat = parent.worldMatrix;

        if (cameraMat) m3.multiplyInPlace(invMat, cameraMat, invMat);

        if (unscale)
        {
            invMat = m3.scale(parent.worldMatrix, 1/parent.properties.scale[0], 1/parent.properties.scale[1]);
        }
        invMat = m3.inverse(invMat);

        for (let i = 0; i < vecArr.length; i++)
        {
            vecArr[i] = m3.transformPoint(invMat, vecArr[i]);
        }
    } 

export const isNumeric = (str) => {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  };

export const changeValueNumeric = (startVal, target, inputKey) =>
  {
      let newString;

      const isNumber = isNumeric(inputKey);

      if (target == startVal && inputKey !== "Backspace" && isNumber)
      {
          newString = inputKey;
      }
      else if (target === " " && isNumber)
      {
        newString = inputKey;
      }
      else if (inputKey == "Backspace")
      {
              newString = target.slice(0,-1);
      }
      else {
          if (isNumber || inputKey === ".")
          {
              newString = target + inputKey;
          }
      }

      return newString;
  }

  export const hexToRgb = (hex, alpha = 1, isNormalize = true) => {
    let norm = isNormalize ? 255 : 1;
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16)/norm,
      parseInt(result[2], 16)/norm,
      parseInt(result[3], 16)/norm,
      alpha
     ] : null;
  }

  export const percToFraction = (perc) => {
    if (typeof perc !== "string") throw new Error("Input must be a string!");
    if (perc[perc.length-1] !== '%') throw new Error("Incorrect percentage input!");

    let newString = perc.slice(0,perc.length-1);

    return parseFloat(newString)*0.01;
  }


  export const calcViewProjMat = (w,h,camera) =>
  {
    if (!camera) throw new Error("No camera matrix provided!");

    let projMat = m3.projection(w,h);
    let viewProjectionMat;

    const viewMat = m3.inverse(camera.matrix);
    viewProjectionMat = m3.multiply(projMat, viewMat);

    return viewProjectionMat;
  }



  export const getViewCoords = (worldMat, cameraMatInv) => {
    const newCoords = m3.multiply(cameraMatInv, worldMat);

    return [newCoords[6], newCoords[7]];
  }