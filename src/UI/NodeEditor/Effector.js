export class Effector
{
    name = undefined;
    fnc = undefined;
    argc = undefined; 
    outc = undefined;

    constructor(name, fnc, argc = 1, outc = 1)
    {
        this.setName(name);
        this.setFunction(fnc);
        this.setArgNum(argc);
        this.setOutNum(outc);
    }

    setName(name)
    {
        this.name = name;
    }

    setFunction(fnc)
    {
        this.fnc = fnc;
    }

    setArgNum(argNum)
    {
        this.argc = argNum;
    }

    setOutNum(outc)
    {
        this.outc = outc;
    }
}