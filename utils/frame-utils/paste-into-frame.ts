import { Frame } from "./capture-frame-content";

interface PasteIntoFrameProps {
  imageUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement> | HTMLCanvasElement;
  frame: Frame;
}

export const pasteIntoFrame = ({
  imageUrl,
  canvasRef,
  frame,
}: PasteIntoFrameProps) => {
  return new Promise<void>((resolve, reject) => {
    const canvas =
      canvasRef instanceof HTMLCanvasElement ? canvasRef : canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!context) {
      reject("Canvas context not found");
      return;
    }

    const imageToPaste = new Image();
    imageToPaste.crossOrigin = "anonymous";
    imageToPaste.src = imageUrl;

    imageToPaste.onload = async () => {
      context.drawImage(
        imageToPaste,
        frame.x,
        frame.y,
        frame.width,
        frame.height
      );

      if (canvas) {
        const dataUrl = canvas.toDataURL();
      }
      resolve(); // Resolve the promise after drawing the image and setting the data URL
    };

    imageToPaste.onerror = () => {
      reject("Error loading image");
    };
  });
};
