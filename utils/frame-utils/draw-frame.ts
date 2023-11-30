import { Frame } from "./capture-frame-content";

export const drawFrame = ({
  frame,
  maskContext,
  frameHover,
}: {
  frame: Frame;
  maskContext: any;
  frameHover: boolean;
}) => {
  if (
    !frame ||
    frame.x == null ||
    frame.y == null ||
    frame.width == null ||
    frame.height == null
  )
    return;

  maskContext.globalCompositeOperation = "source-over";
  maskContext.strokeStyle = "white";
  maskContext.lineWidth = 1;

  if (frameHover) {
    maskContext.fillStyle = "rgba(255, 255, 255, 0.65)";
    maskContext.fillRect(frame.x, frame.y, frame.width, frame.height);
  }
  maskContext.strokeRect(frame.x, frame.y, frame.width, frame.height);
};
