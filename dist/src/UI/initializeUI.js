import { TextFont } from "../Text/TextFont.js";
import { ubuntu_font } from "../fonts/ubuntu.js";
import { ubuntu_bold_font } from "../fonts/ubuntu-bold.js";
import { roboto_bold_font } from "../fonts/roboto-bold.js";
import { roboto_font } from "../fonts/roboto.js";
export const setUpMainFont = (app, UI) => {
    // Setup font
    // Regular
    const fontSettings = {
        textureSrc: "./src/fonts/roboto.png",
        texResolution: [1024, 1024],
        color: [1, 1, 1.3, 1],
        subpixel: 1,
        decoder: roboto_font
    };
    const robotoFont = new TextFont(app.gl, fontSettings, app.gl.LUMINANCE);
    // Bold
    const fontBoldSettings = {
        textureSrc: "./src/fonts/roboto-bold.png",
        texResolution: [1024, 1024],
        color: [1, 1, 1.3, 1],
        subpixel: 1,
        decoder: roboto_bold_font
    };
    const robotoBoldFont = new TextFont(app.gl, fontBoldSettings, app.gl.LUMINANCE);
    return [robotoFont, robotoBoldFont];
};
//# sourceMappingURL=initializeUI.js.map