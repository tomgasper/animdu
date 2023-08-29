export class UINodeParam
{
    name = "";
    value = "0";

    constructor(paramName, type = "TEXT_INPUT", value = "0")
    {
        this.type = type;
        this.name = paramName;
        this.value = value;
    }
}