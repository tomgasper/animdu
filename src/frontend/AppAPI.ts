import { App } from "../App/App";

export class AppAPI
{
    private appRef : App;

    constructor(appRef)
    {
        this.appRef = appRef;
    }

    public sayHi() : number
    {
        return this.appRef.fps;
    }

    public createRectangle()
    {
        this.appRef.createRectangle();
    }
}