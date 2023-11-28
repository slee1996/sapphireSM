import { Frame } from ".";

interface MoveFrameProps {
  event: any;
  canvasRef: any;
  frame: Frame;
}

export const moveFrame = ({ event, canvasRef, frame }: MoveFrameProps) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const x = event.clientX - rect.left; // x position within the canvas
  const y = event.clientY - rect.top; // y position within the canvas

  // now, check if x and y are inside the frame's boundaries
  if (
    x >= frame.x &&
    x <= frame.x + frame.width &&
    y >= frame.y &&
    y <= frame.y + frame.height
  ) {
    console.log("Clicked inside the frame, nice!");
  }
};
