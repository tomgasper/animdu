export class ObjAnimation
{
    obj = undefined;
    componentsToProcess = [];

    constructor(objRef, componentList)
    {
        this.obj = objRef;
        this.componentsToProcess = componentList;
    }
}