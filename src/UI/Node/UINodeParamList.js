import { UINodeParam } from "./UINodeParam.js";

export class UINodeParamList
{
    params = [];

    constructor(initParamName)
    {
        if (typeof initParamName == "string")
        {
            const newParam = new UINodeParam(initParamName);
            this.addNewParam(newParam);
        }
        else if (Array.isArray(initParamName)) {
            initParamName.forEach((obj) =>
            {
                if (!(obj instanceof UINodeParam)) throw Error("Error creaing UINodeParamList Object, incorrect input!");
            })
            this.params = initParamName;
        }
        else throw Error("Param name must be of type string");
    }

    addNewParam(param)
    {
        if (!(param instanceof UINodeParam)) throw Error("Incorrect parameter type");

        this.params.push(param);
    }

    removeParam(paramNames)
    {
        paramNames.forEach( (paramName) => {
            this.params = this.params.filter( param => param.name !== paramName );
        })
    }
}