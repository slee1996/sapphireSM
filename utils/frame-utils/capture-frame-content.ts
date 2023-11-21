export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CaptureFrameContentProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  maskCanvasRef: React.RefObject<HTMLCanvasElement>;
  frame: Frame;
}

export const captureFrameContent = ({
  canvasRef,
  maskCanvasRef,
  frame,
}: CaptureFrameContentProps) => {
  const maskContext = maskCanvasRef.current?.getContext("2d");
  const mainContext = canvasRef.current?.getContext("2d");

  if (!maskContext || !mainContext) {
    return;
  }

  const maskFrameData = maskContext.getImageData(
    frame.x,
    frame.y,
    frame.width,
    frame.height
  );
  const mainFrameData = mainContext.getImageData(
    frame.x,
    frame.y,
    frame.width,
    frame.height
  );

  const maskTempCanvas = document.createElement("canvas");
  maskTempCanvas.width = frame.width;
  maskTempCanvas.height = frame.height;
  const maskTempContext = maskTempCanvas.getContext("2d");

  const mainTempCanvas = document.createElement("canvas");
  mainTempCanvas.width = frame.width;
  mainTempCanvas.height = frame.height;
  const mainTempContext = mainTempCanvas.getContext("2d");

  maskTempContext?.putImageData(maskFrameData, 0, 0);
  mainTempContext?.putImageData(mainFrameData, 0, 0);

  const maskDataURL = maskTempCanvas.toDataURL("image/png");
  const mainDataURL = mainTempCanvas.toDataURL("image/png");

  return {
    maskDataURL,
    mainDataURL,
  };
};
