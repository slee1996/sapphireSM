import { getMousePos } from "../get-mouse-pos";

interface StartRepositioningProps {
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>;
  canvasRef: any;
  frame: any;
  setIsDragging: any;
  setDragStart: any;
}

export const startRepositioning = ({
  e,
  canvasRef,
  frame,
  setIsDragging,
  setDragStart,
}: StartRepositioningProps) => {
  if (canvasRef.current) {
    let clientX, clientY;

    if (e.nativeEvent instanceof TouchEvent) {
      const touch = e.nativeEvent.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX;
      clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY;
    }

    const { x, y } = getMousePos({
      canvas: canvasRef.current,
      x: clientX,
      y: clientY,
    });

    if (
      x >= frame.x &&
      x <= frame.x + frame.width &&
      y >= frame.y &&
      y <= frame.y + frame.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - frame.x, y: y - frame.y });
    }
  }
};
