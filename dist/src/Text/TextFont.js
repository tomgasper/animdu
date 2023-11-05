export class TextFont {
    gl = {};
    texture = {};
    textureSrcStr = "";
    textureImg = undefined;
    textureFormat = undefined;
    color = [0, 0, 0, 1];
    subpixel = 1.0;
    // Javascript file with info needed for the shader to know where each letter is on the texture image
    decoder = {};
    constructor(gl, fontSettings, textureFormat) {
        this.gl = gl;
        if (fontSettings.color)
            this.color = fontSettings.color;
        if (fontSettings.subpixel)
            this.subpixel = fontSettings.subpixel;
        // Save info about the texture source
        this.textureSrcStr = fontSettings.textureSrc;
        this.decoder = fontSettings.decoder;
        this.textureFormat = textureFormat | gl.LUMINANCE;
        this.texResolution = fontSettings.texResolution;
        // Create new texture for WebGl
        this.texture = gl.createTexture();
        // Loading texture async
        this.loadTexture(this.gl, this.textureSrcStr);
    }
    loadTexture(gl, imgSrc) {
        const img = new Image();
        img.src = imgSrc;
        // Set unloaded img to have something for shader to access
        this.textureImg = img;
        // Temp texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.textureFormat, 1, 1, 0, this.textureFormat, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        img.addEventListener("load", () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, this.textureFormat, this.textureFormat, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            // Set new img data when loading finished
            this.textureImg = img;
        });
        img.addEventListener("error", () => {
            throw new Error("Invalid texture source!");
        });
    }
}
//# sourceMappingURL=TextFont.js.map