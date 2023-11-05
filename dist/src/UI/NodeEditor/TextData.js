export class TextData {
    data;
    pos;
    constructor(data, pos) {
        if (!data || !pos) {
            throw new Error("Incorrect Text data or Text position!");
            return;
        }
        this.data = data;
        this.pos = pos;
    }
}
//# sourceMappingURL=TextData.js.map