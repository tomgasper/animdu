import { RenderableObject } from "../RenderableObject";
import { Composition } from "../Composition/Composition";

export type anyFnc = (...args: any[]) => any;
export type anyObj = { [key: string] : any};
export type IDType = { id: number, arrIndx: number };

export type RenderQueueType = {
    mask: RenderableObject[],
    objs: RenderableObject[]
}

export interface SceneManagerState {
    objsToDraw: RenderQueueType;
    activeObjID: IDType;
    objToDragID: IDType;
    objUnderMouse: IDType;
    pickingData: Uint8Array[4]; // Assuming it's a Uint8Array of length 4
    activeComp: Composition;
}

export interface InputManagerState {
    keyPressed: Set<string>;
    isMouseDown: boolean;
    isMouseClicked: boolean;
    isMouseClickedTwice: boolean;
    isMouseWheel: boolean;
    wheelYDelta: number;
    mouseX: number;
    mouseY: number;
    clickOffsetRef: { x: number; y: number } | undefined;
    prevMouseX: number;
    prevMouseY: number;
}