export class UINodeParam
{
    name = "";
    value = 0;

    constructor(paramName, value = 0)
    {
        this.name = paramName;
        this.value = value;
    }
}