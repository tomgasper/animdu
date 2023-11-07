import { RenderableObject } from "../RenderableObject.js";

import { ContainerStyle } from "./NodeEditor/NodeEditorStyleTypes.js";

interface RefType {
    [key: string] : any
};

export class UIObject extends RenderableObject{

    protected _ref : RefType=
    {
        app: undefined,
        UI: undefined
    }

    container : RenderableObject | undefined;
    elements = {};

    containerStyle : ContainerStyle =
    {
        width: undefined,
        height: undefined,
        colour: undefined,
        margin:
        {
            x: undefined,
            y: undefined
        }
    };

    style : RefType;

    constructor(appRef : any, buffInfo)
    {
        super(buffInfo);

        this.style = {
            container: this.containerStyle
        }

        this._ref.app = appRef;
        this._ref.UI = appRef.UI;
    }

    setName(name : string)
    {
        this.name = name;
    }
}