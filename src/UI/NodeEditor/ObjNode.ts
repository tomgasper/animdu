import { UINode } from './UINode';

import { UINodeHandle } from './UINodeHandle';

import { createNewText } from '../../Text/textHelper';

import { hexToRgb } from '../../utils';
import { RenderableObject } from '../../RenderableObject';
import { TextData } from './TextData';

export class ObjNode extends UINode
{
    type : string = "_NODE_OBJ";
    txtArr : TextData[];
    obj : RenderableObject;

    constructor(appRef, buffInfo, obj : RenderableObject)
    {
        super(appRef, buffInfo);

        this.addExtraParam(
            {
                resolution: [this._ref.app.gl.canvas.width, this._ref.app.gl.canvas.height]
            });

        this.obj = obj;

        this.initialize();
    }

    initialize()
    {
        // Set appropriate style for the current node
        [this.style.container.width, this.style.container.height] = [130, 100];
        this.style.heading.text.size = 10;
        this.style.heading.text.upscale = 2.0;

        this.style.margin.x = 10;
        this.style.margin.y = 10;

        // Create aliases for better readability
        const width = this.style.container.width;
        const height = this.style.container.height;

        const hFontSize =  this.style.heading.text.size;
        const fontBody = this.style.body.text;
        const fontHeading = this.style.heading.text;

        const upscale = 2.0;

        this.setScale([this.style.container.width/100, this.style.container.height/100]);

        // Set properties
        this.setOriginalColor(hexToRgb(this.style.container.colour));

        // Set handlers
        this.handlers.onMouseMove = () => { this.handleMouseMove() };

        // Create handlers
        const cirlceBuffer = this._ref.UI.UIBuffers.UINode.handle.buffer;

        const handleR = new UINodeHandle(this._ref.app, cirlceBuffer, this, this);
        handleR.setPosition([width, height/2]);
        handleR.setOriginalColor([0.2,0.2,0.2,1])
        handleR.setCanBeMoved(false);
        handleR.setParent(this);
        this.elements.handles.R = [ handleR ];

        // Render text
        this.txtArr = 
        [
            new TextData(String(this.obj.name), [0,0])
        ];

       // creating text batch for this node, to avoid creating a lot of small buffers
        const txtBatch = createNewText(this._ref.app.gl, this._ref.app.programs[2], this.txtArr, hFontSize * upscale, fontHeading.font, hexToRgb(fontHeading.colour));
        txtBatch.setCanBeMoved(false);
        txtBatch.setPosition([ this.style.margin.x, this.style.margin.y ]);
        txtBatch.setScale([0.5,0.5]);
        txtBatch.setParent(this);
    }

    getObj() : RenderableObject
    {
        return this.obj;
    }
}