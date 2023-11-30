import { Frame } from ".";

export const drawFrameScaled = ({
  frame,
  maskContext,
  frameHover,
  img,
  zoom = 1,
  positionX,
  positionY,
  onscreenCanvas,
}: {
  frame: Frame;
  maskContext: CanvasRenderingContext2D;
  frameHover: boolean;
  img: HTMLImageElement;
  zoom?: number;
  positionX: number;
  positionY: number;
  onscreenCanvas: any;
}) => {
  // Check for required inputs
  if (!frame || !maskContext || !img || !onscreenCanvas) {
    console.error("Missing required parameters.");
    return;
  }

  // Calculate the inverse scaling factor based on drawImageScaled logic
  const hRatio = (maskContext.canvas.width / img.width / 2) * zoom;
  const vRatio = (maskContext.canvas.height / img.height / 2) * zoom;
  const ratio = Math.min(hRatio, vRatio);
  const inverseRatio = 1 / ratio;

  const frameWidth = frame.width * inverseRatio;
  const frameHeight = frame.height * inverseRatio;

  return { positionX, positionY, frameWidth, frameHeight };
};
