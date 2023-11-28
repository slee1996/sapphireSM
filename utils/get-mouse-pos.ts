interface GetMousePosProps {
  canvas: any;
  x: any;
  y: any;
}

export const getMousePos = ({ canvas, x, y }: GetMousePosProps) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const scaledX = (x - rect.left) * scaleX;
  const scaledY = (y - rect.top) * scaleY;

  return { x: scaledX, y: scaledY };
};
