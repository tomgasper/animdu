export class TextData
{
    data : string;
    pos: number[];

    constructor(data: string, pos: number[])
    {
        if (!data || !pos)
        {
            throw new Error("Incorrect Text data or Text position!");
            return;
        }
        this.data = data;
        this.pos = pos;
    }
}