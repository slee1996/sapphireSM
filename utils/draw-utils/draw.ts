interface DrawProps {
  nativeEvent: any;
  maskCanvasRef: any;
  isDrawing: boolean;
}

export const draw = ({ nativeEvent, maskCanvasRef, isDrawing }: DrawProps) => {
  console.log('draw')
  if (!isDrawing) {
    return;
  }
  const { offsetX, offsetY } = nativeEvent;
  if (maskCanvasRef.current) {
    const context = maskCanvasRef.current.getContext("2d");
    if (context) {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    }
  }
};
