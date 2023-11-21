import { Frame } from "./capture-frame-content";

interface PasteIntoFrameProps {
  imageUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  frame: Frame;
  setCanvasDataUrl: (dataUrl: string) => void; // Assuming setCanvasDataUrl accepts a string
}

export const pasteIntoFrame = ({
  imageUrl,
  canvasRef,
  frame,
  setCanvasDataUrl,
}: PasteIntoFrameProps) => {
  const canvas = canvasRef.current;
  const context = canvas?.getContext("2d");

  if (!context) return;

  const imageToPaste = new Image();
  imageToPaste.crossOrigin = "anonymous"; // Set cross-origin attribute
  imageToPaste.src = imageUrl;

  imageToPaste.onload = () => {
    context.drawImage(
      imageToPaste,
      frame.x,
      frame.y,
      frame.width,
      frame.height
    );

    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setCanvasDataUrl(dataUrl);
    }
  };
};
