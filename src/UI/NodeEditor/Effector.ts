import { anyFnc } from "../../types/globalTypes";

export class Effector
{
    name: string;
    fnc : any;
    argc : number; 
    outc : number;

    constructor(name : string, fnc : anyFnc, argc : number = 1, outc : number = 1)
    {
        this.setName(name);
        this.setFunction(fnc);
        this.setArgNum(argc);
        this.setOutNum(outc);
    }

    setName(name : string)
    {
        this.name = name;
    }

    setFunction(fnc : anyFnc)
    {
        this.fnc = fnc;
    }

    setArgNum(argNum : number)
    {
        this.argc = argNum;
    }

    setOutNum(outc : number)
    {
        this.outc = outc;
    }
}