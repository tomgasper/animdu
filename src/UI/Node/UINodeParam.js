export class UINodeParam
{
    name = "";
    value = 0;

    constructor(paramName, value = 0, type = "TEXT_INPUT")
    {
        this.name = paramName;
        this.value = value;
        this.type = type;
    }
}