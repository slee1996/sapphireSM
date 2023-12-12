import { getMousePos } from "./get-mouse-pos";

export const checkHover = (
  e: any,
  canvasRef: any,
  imgDimensions: any,
  frame: any,
  zoom: any,
  positionX: any,
  positionY: any
) => {
  if (canvasRef.current) {
    let clientX, clientY;

    if (e.nativeEvent instanceof TouchEvent) {
      const touch = e.nativeEvent.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y } = getMousePos({
      canvas: canvasRef.current,
      x: clientX,
      y: clientY,
    });

    let hRatio = (canvasRef.current.width / imgDimensions.width / 2) * zoom;
    let vRatio = (canvasRef.current.height / imgDimensions.height / 2) * zoom;
    let ratio = Math.min(hRatio, vRatio);

    let scaledWidth = imgDimensions.width * ratio;
    let scaledHeight = imgDimensions.height * ratio;

    let centerShift_x = (canvasRef.current.width - scaledWidth) / 2 - positionX;
    let centerShift_y =
      (canvasRef.current.height - scaledHeight) / 2 - positionY;

    if (
      x >= frame.x &&
      x <= frame.x + frame.width &&
      y >= frame.y &&
      y <= frame.y + frame.height
    ) {
      return { imageHover: false, frameHover: true };
    } else if (
      x >= centerShift_x &&
      x <= centerShift_x + scaledWidth &&
      y >= centerShift_y &&
      y <= centerShift_y + scaledHeight
    ) {
      return { imageHover: true, frameHover: false };
    } else {
      return { imageHover: false, frameHover: false };
    }
  }
};
