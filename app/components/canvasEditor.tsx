import { default as ImageComponent } from "next/image";
import { useRef, useEffect, useState } from "react";
import { sendEdit } from "@/utils/send-edit";

const CanvasEditor = ({
  src,
  originalPrompt,
}: {
  src: string;
  originalPrompt: string;
}) => {
  const canvasRef: any = useRef(null);
  const maskCanvasRef: any = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [imageEditPrompt, setImageEditPrompt] = useState(originalPrompt);
  const [imageEdits, setImageEdits] = useState<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas?.getContext("2d");

    const image = new Image();

    image.src = src;

    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      maskContext.drawImage(image, 0, 0, maskCanvas.width, maskCanvas.height);
    };

    return () => {
      image.onload = null;
    };
  }, [src]);

  const startDrawing = ({ nativeEvent }: { nativeEvent: any }) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartPoint({ x: offsetX, y: offsetY });
    const context = maskCanvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: { nativeEvent: any }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    const context = maskCanvasRef.current.getContext("2d");
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) {
      return;
    }
    const context = maskCanvasRef.current.getContext("2d");

    context.lineTo(startPoint.x, startPoint.y);
    context.closePath();

    context.globalCompositeOperation = "destination-out";

    context.stroke();
    context.fill();

    context.globalCompositeOperation = "source-over";

    setIsDrawing(false);
  };

  return (
    <div>
      <div className='flex flex-col'>
        Image Edits
        <div className='flex flex-row justify-evenly'>
          {imageEdits
            ? imageEdits.map((i: any, k: any) => (
                <ImageComponent
                  key={k}
                  src={i.url}
                  width={400}
                  height={400}
                  alt=''
                />
              ))
            : null}
        </div>
        Image Edit Prompt
        <textarea
          value={imageEditPrompt}
          className='text-black m-4 rounded-xl px-4 py-1'
          onChange={(e) => setImageEditPrompt(e.target.value)}
        />
        <button
          className='rounded-full bg-white m-2 text-black'
          onClick={() => {
            sendEdit({
              image: canvasRef,
              mask: maskCanvasRef,
              prompt: imageEditPrompt,
              setImageEdits,
            });
          }}
        >
          Send image edit
        </button>
      </div>
      <div className='relative'>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className='absolute right-0 top-0'
        />
        <canvas
          ref={maskCanvasRef}
          width={400}
          height={400}
          className='absolute right-0 top-0'
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
        />
      </div>
    </div>
  );
};

export default CanvasEditor;
