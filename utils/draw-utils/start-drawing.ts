interface StartDrawingProps {
  nativeEvent: any;
  setStartPoint: any;
  maskCanvasRef: any;
  setIsDrawing: any;
}

export const startDrawing = ({
  nativeEvent,
  setStartPoint,
  maskCanvasRef,
  setIsDrawing,
}: StartDrawingProps) => {
  const { offsetX, offsetY } = nativeEvent;

  setStartPoint({ x: offsetX, y: offsetY });

  if (maskCanvasRef.current) {
    const context = maskCanvasRef.current.getContext("2d");
    if (context) {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  }
};
