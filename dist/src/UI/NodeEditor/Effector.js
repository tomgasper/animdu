export class Effector {
    constructor(name, fnc, argc = 1, outc = 1) {
        this.name = undefined;
        this.fnc = undefined;
        this.argc = undefined;
        this.outc = undefined;
        this.setName(name);
        this.setFunction(fnc);
        this.setArgNum(argc);
        this.setOutNum(outc);
    }
    setName(name) {
        this.name = name;
    }
    setFunction(fnc) {
        this.fnc = fnc;
    }
    setArgNum(argNum) {
        this.argc = argNum;
    }
    setOutNum(outc) {
        this.outc = outc;
    }
}
//# sourceMappingURL=Effector.js.map