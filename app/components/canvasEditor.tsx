import { default as ImageComponent } from "next/image";
import { useRef, useEffect, useState } from "react";
import { sendEdit } from "@/utils/send-edit";
import {
  captureFrameContent,
  drawFrame,
  Frame,
  pasteIntoFrame,
} from "@/utils/frame-utils";
// import { draw, startDrawing, stopDrawing } from "@/utils/draw-utils";

const CanvasEditor = ({
  src,
  originalPrompt,
  width,
  height,
}: {
  src: string;
  originalPrompt: string;
  width: number;
  height: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState(src);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [imageEditPrompt, setImageEditPrompt] = useState(originalPrompt);
  const [imageEdits, setImageEdits] = useState<any>(null);
  const [frame, setFrame] = useState<Frame>({
    x: 50,
    y: 50,
    width: height / 3,
    height: height / 3,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas?.getContext("2d");

    if (!context || !maskContext) return; // Ensure both contexts are available

    const image = new Image();
    image.src = canvasDataUrl;

    image.onload = () => {
      if (canvas && maskCanvas) {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        maskContext.drawImage(image, 0, 0, maskCanvas.width, maskCanvas.height);
        drawFrame({ frame, maskContext });
      }
    };

    return () => {
      image.onload = null;
    };
  }, [canvasDataUrl, frame, canvasRef, maskCanvasRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (maskCanvasRef.current) {
      const rect = maskCanvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (
        x >= frame.x &&
        x <= frame.x + frame.width &&
        y >= frame.y &&
        y <= frame.y + frame.height
      ) {
        setIsDragging(true);
        setDragStart({ x: x - frame.x, y: y - frame.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    if (maskCanvasRef.current) {
      const rect = maskCanvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update frame position
      setFrame({
        ...frame,
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const startDrawing = ({ nativeEvent }: { nativeEvent: any }) => {
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

  const draw = ({ nativeEvent }: { nativeEvent: any }) => {
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

  const stopDrawing = () => {
    if (!isDrawing) {
      return;
    }
    if (maskCanvasRef.current) {
      const context = maskCanvasRef.current.getContext("2d");
      if (context) {
        context.lineTo(startPoint.x, startPoint.y);
        context.closePath();

        context.globalCompositeOperation = "destination-out";

        context.stroke();
        context.fill();

        context.globalCompositeOperation = "source-over";

        setIsDrawing(false);
      }
    }
  };

  return (
    <div className='w-full mb-10 flex flex-col justify-start items-start'>
      <div className='flex flex-col w-full'>
        Image Edits
        <div className='flex flex-row justify-start overflow-x-scroll space-x-2 m-2'>
          {imageEdits
            ? imageEdits.map((i: any, k: any) => (
                <div key={k}>
                  <button
                    onClick={() => {
                      pasteIntoFrame({
                        imageUrl: `data:image/jpeg;base64,${i.b64_json}`,
                        canvasRef,
                        frame,
                        setCanvasDataUrl,
                      });
                    }}
                  >
                    Paste edit into original image
                  </button>
                  <ImageComponent
                    src={`data:image/jpeg;base64,${i.b64_json}`}
                    width={width}
                    height={height}
                    alt=''
                  />
                </div>
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
            const imagesToSend = captureFrameContent({
              canvasRef,
              maskCanvasRef,
              frame,
            });
            sendEdit({
              image: imagesToSend?.mainDataURL as string,
              mask: imagesToSend?.maskDataURL as string,
              prompt: imageEditPrompt,
              setImageEdits,
            });
          }}
        >
          Send image edit
        </button>
      </div>
      <a
        href={canvasDataUrl}
        title='Download Image'
        download='generatedImage.jpg'
      >
        Download Image
      </a>
      <div className='relative w-full h-full mb-10 p-10'>
        <div>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className='absolute top-0 left-0 pb-10'
          />
          <canvas
            ref={maskCanvasRef}
            width={width}
            height={height}
            className='absolute top-0 left-0 pb-10'
            onMouseDown={(e) => {
              if (e.shiftKey) {
                handleMouseDown(e);
              } else {
                startDrawing(e);
              }
            }}
            onMouseUp={(e) => {
              if (e.shiftKey) {
                handleMouseUp();
              } else {
                stopDrawing();
              }
            }}
            onMouseOut={() => stopDrawing()}
            onMouseMove={(e) => {
              if (e.shiftKey) {
                handleMouseMove(e);
              } else {
                draw(e);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
