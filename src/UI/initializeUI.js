import { TextFont } from '../Text/TextFont';

import { ubuntu_font } from '../fonts/ubuntu';
import { ubuntu_bold_font } from '../fonts/ubuntu-bold';

import { roboto_bold_font } from '../fonts/roboto-bold';
import { roboto_font } from '../fonts/roboto';

import robotoTexture from "../fonts/robotoTex.png"
import robotoBoldTexture from '../fonts/roboto-boldTex.png';

export const setUpMainFont = (app, UI) =>
    {
     // Setup font

     // Regular
    const fontSettings = {
        textureSrc: robotoTexture,
        texResolution: [1024,1024],
        color: [1,1,1.3,1],
        subpixel: 1,
        decoder: roboto_font
    };
    const robotoFont = new TextFont(app.gl, fontSettings, app.gl.LUMINANCE);

     // Bold
     const fontBoldSettings = {
        textureSrc: robotoBoldTexture,
        texResolution: [1024,1024],
        color: [1,1,1.3,1],
        subpixel: 1,
        decoder: roboto_bold_font
    };
    const robotoBoldFont = new TextFont(app.gl, fontBoldSettings, app.gl.LUMINANCE);

    return [robotoFont, robotoBoldFont];
    }