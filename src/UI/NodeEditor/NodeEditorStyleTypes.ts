export type Color = [number, number, number, number];

export interface Margin {
  x: number | undefined;
  y: number | undefined;
}

export interface Text {
  font: string | undefined;
  size: number;
  colour: string | undefined;
  lineOffset?: number;
  paramTextOffsetY?: number;
  paramTextOffsetX?: number;
  margin: Margin;
  upscale: number;
}

export interface HeadingStyle {
  text: Text;
}

export interface BodyStyle {
  margin: Margin;
  text: Text;
}

export interface HandleStyle {
  colour: number[] | undefined;
  position: number[] | undefined;
}

export interface HandlesStyle {
  L: HandleStyle;
  R: HandleStyle;
}

export interface ContainerStyle {
  width: number | undefined;
  height: number | undefined;
  colour: string | undefined;
  margin: Margin;
}

export interface Style {
  container: ContainerStyle;
  margin: Margin;
  heading: HeadingStyle;
  body: BodyStyle;
  handles: HandlesStyle;
}