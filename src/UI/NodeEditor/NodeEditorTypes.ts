export interface TextArray {
    data: string,
    pos: number[]
};

export type LineConnection = {
    isConnected: boolean;
    type: string | undefined;
    connectedObj: any | undefined;
    animationBreak: number;
}

export interface Line {
    width: number;
    data: number[];
    obj: any | undefined;
    connection: LineConnection
    update: (obj: any, data : number []) => void;
}