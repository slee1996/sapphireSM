export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CaptureFrameContentProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  img: any;
  positionX: any;
  positionY: any;
  scaledFrame: any;
}

export const captureFrameContent = ({
  canvasRef,
  img,
  positionX,
  positionY,
  scaledFrame,
}: CaptureFrameContentProps) => {
  const offscreenContext = canvasRef.current?.getContext("2d"); // offscreen canvas
  const imgCanvas = document.createElement("canvas");
  const imgContext = imgCanvas.getContext("2d");

  if (imgContext) {
    imgCanvas.width = img.width;
    imgCanvas.height = img.height;
    imgContext.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      img.width,
      img.height
    );
  }

  if (!offscreenContext) {
    return;
  }

  const mainFrameData = imgContext?.getImageData(
    positionX,
    positionY,
    scaledFrame.frameWidth,
    scaledFrame.frameHeight
  );
  const maskFrameData = offscreenContext.getImageData(
    positionX,
    positionY,
    scaledFrame.frameWidth,
    scaledFrame.frameHeight
  );

  const maskTempCanvas = document.createElement("canvas");
  maskTempCanvas.width = scaledFrame.frameWidth;
  maskTempCanvas.height = scaledFrame.frameHeight;
  const maskTempContext = maskTempCanvas.getContext("2d");

  const mainTempCanvas = document.createElement("canvas");
  mainTempCanvas.width = scaledFrame.frameWidth;
  mainTempCanvas.height = scaledFrame.frameHeight;
  const mainTempContext = mainTempCanvas.getContext("2d");

  if (maskFrameData && mainFrameData) {
    maskTempContext?.putImageData(maskFrameData, 0, 0);
    mainTempContext?.putImageData(mainFrameData, 0, 0);
  }

  const maskDataURL = maskTempCanvas.toDataURL("image/png");
  const mainDataURL = mainTempCanvas.toDataURL("image/png");

  maskTempCanvas.remove();
  mainTempCanvas.remove();

  return {
    maskDataURL,
    mainDataURL,
  };
};
