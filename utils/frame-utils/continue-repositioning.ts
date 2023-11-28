import { getMousePos } from "../get-mouse-pos";

interface ContinueRepositioingProps {
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;
  isDragging: boolean;
  canvasRef: any;
  setFrame: any;
  frame: any;
  dragStart: any;
  imgDimensions: { width: number; height: number };
  zoom: number;
  positionX: number;
  positionY: number;
}

export const continueRepositioning = ({
  e,
  isDragging,
  canvasRef,
  setFrame,
  frame,
  dragStart,
  imgDimensions,
  zoom,
  positionX,
  positionY,
}: ContinueRepositioingProps) => {
  if (!isDragging || !canvasRef.current) return;

  let clientX, clientY;

  if (e.nativeEvent instanceof TouchEvent) {
    const touch = e.nativeEvent.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX;
    clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY;
  }

  const newPos = getMousePos({
    canvas: canvasRef.current,
    x: clientX,
    y: clientY,
  });

  let newX = newPos.x - dragStart.x;
  let newY = newPos.y - dragStart.y;

  // Calculate image boundaries
  let hRatio = (canvasRef.current.width / imgDimensions.width / 2) * zoom;
  let vRatio = (canvasRef.current.height / imgDimensions.height / 2) * zoom;
  let ratio = Math.min(hRatio, vRatio);

  let scaledWidth = imgDimensions.width * ratio;
  let scaledHeight = imgDimensions.height * ratio;

  let imageLeft = (canvasRef.current.width - scaledWidth) / 2 - positionX;
  let imageTop = (canvasRef.current.height - scaledHeight) / 2 - positionY;
  let imageRight = imageLeft + scaledWidth;
  let imageBottom = imageTop + scaledHeight;

  // Constrain frame within image boundaries
  newX = Math.max(imageLeft, Math.min(newX, imageRight - frame.width));
  newY = Math.max(imageTop, Math.min(newY, imageBottom - frame.height));

  setFrame({
    ...frame,
    x: newX,
    y: newY,
  });
};
