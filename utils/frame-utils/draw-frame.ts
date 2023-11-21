import { Frame } from "./capture-frame-content";

export const drawFrame = ({
  frame,
  maskContext,
}: {
  frame: Frame;
  maskContext: any;
}) => {
  if (
    !frame ||
    frame.x == null ||
    frame.y == null ||
    frame.width == null ||
    frame.height == null
  )
    return;

  maskContext.strokeStyle = "black";
  maskContext.strokeRect(frame.x, frame.y, frame.width, frame.height);
  maskContext.fill();
};
