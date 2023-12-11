import { readPixelsAsync } from "../lib/asyncreadpixels.js";

export function setUpPickingFramebuffer(gl, targetTexture, depthStencilBuffer)
{
   // Create and bind the framebuffer
   let fb = gl.createFramebuffer();
   gl.bindFramebuffer(gl.FRAMEBUFFER,fb);

   // attach the texture as the first color attachment
   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0)
   gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthStencilBuffer);

   gl.checkFramebufferStatus(gl.FRAMEBUFFER);

   return fb;
}

export function createPickingTargetTexture(gl)
{
    let targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1280, 720, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return targetTexture;
}

export function createDepthBuffer(gl)
{
  // Create a depth renderbuffer
  let depthStencilBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencilBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, 1280,720);

  return depthStencilBuffer;
}

export function setFramebufferAttachmentSizes(gl, depthStencilBuffer, width, height, renderTexture) {
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencilBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL ,width,height);
  }

export function getIdFromCurrentPixel(glRef, pickingDataRef, mouseX, mouseY)
{
  const pixelX = mouseX * glRef.canvas.width / glRef.canvas.clientWidth;
  const pixelY = glRef.canvas.height - mouseY * glRef.canvas.height / glRef.canvas.clientHeight - 1;

    readPixelsAsync(
      glRef,
      pixelX,            // x
      pixelY,            // y
      1,                 // width
      1,                 // height
      appRef.gl.RGBA,           // format
      appRef.gl.UNSIGNED_BYTE,  // type
      pickingDataRef);             // typed array to hold result
  
      const arrIndx = pickingDataRef[0];
      const id = (pickingDataRef[1] << 0) + (pickingDataRef[2] << 8) + (pickingDataRef[3] << 16);
  
      return { arrIndx: arrIndx , id: id };
    }
    