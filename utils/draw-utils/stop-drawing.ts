interface StopDrawingProps {
  isDrawing: boolean;
  maskCanvasRef: any;
  setIsDrawing: any;
  startPoint: { x: number; y: number };
}

export const stopDrawing = ({
  isDrawing,
  maskCanvasRef,
  setIsDrawing,
  startPoint,
}: StopDrawingProps) => {
  if (!isDrawing) {
    return;
  }
  if (maskCanvasRef.current) {
    const context = maskCanvasRef.current.getContext("2d");

    if (context) {
      context.lineTo(startPoint.x, startPoint.y);
      context.closePath();

      context.stroke();
      context.fill();

      setIsDrawing(false);
    }
  }
};
