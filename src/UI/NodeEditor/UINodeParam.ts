export class UINodeParam
{
    type : string;
    name : string = "";
    value : number | number [] = 0;

    constructor(paramName : string, type : string = "TEXT_INPUT", value : number | number[] = 0)
    {
        this.type = type;
        this.name = paramName;
        this.value = value;
    }
}