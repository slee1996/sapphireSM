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

  const adjustFrameSize = (increase = true) => {
    setFrame((currentFrame) => {
      // Define the increment or decrement value
      const delta = increase ? 50 : -50;

      // Calculate new dimensions
      let newWidth = currentFrame.width + delta;
      let newHeight = currentFrame.height + delta;

      // Optionally add boundary checks
      // Example: Ensure the frame does not become smaller than 50x50 or larger than a maximum size
      newWidth = Math.max(50, newWidth); // Replace 50 with your minimum width if different
      newHeight = Math.max(50, newHeight); // Replace 50 with your minimum height if different

      // Optionally add maximum size checks
      // Example: maxWidth and maxHeight are the maximum dimensions you want to allow
      // newWidth = Math.min(newWidth, maxWidth);
      // newHeight = Math.min(newHeight, maxHeight);

      return {
        ...currentFrame,
        width: newWidth,
        height: newHeight,
      };
    });
  };

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
          className='rounded-full bg-white m-2 text-black hover:bg-black hover:text-white'
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
        className='bg-white text-black rounded-full p-2 m-2 hover:bg-black hover:text-white'
      >
        Download Edited Image
      </a>
      <div>
        Adjust Frame Size{" "}
        <button
          onClick={() => adjustFrameSize(false)}
          className='bg-white p-2 m-2 rounded-full text-black hover:bg-black hover:text-white'
        >
          -
        </button>
        <button
          onClick={() => adjustFrameSize()}
          className='bg-white p-2 m-2 rounded-full text-black hover:bg-black hover:text-white'
        >
          +
        </button>
      </div>
      <p>EDITING INSTRUCTIONS</p>
      <p>
        The frame overlay on the picture below contains the area that will be
        sent to the AI for editing.
      </p>
      <p>
        Shift+Click and drag on the frame to move it to the position you want,
        then draw on the picture with a click and drag to define any sections
        that you want erased for inpainting.
      </p>
      <p>
        Once the edited images have generated you will have the option to paste
        them into the framed area. Don&#39;t move the frame or else the image
        edits may end up in the wrong place!
      </p>
      <p>
        If you are simply removing features from the image, leave the image edit
        prompt alone. If you are wanting to generate new objects on the image
        (e.g. add a castle on top of a mountain), it&#39;s best to erase the
        populated prompt and replace it with one more focused on the specific
        object you want to add (e.g. &ldquo;a majestic mountain with a massive
        castle on top&ldquo;)
      </p>
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
            onTouchStart={(e) => {
              console.log("touch");
              e.preventDefault();
              startDrawing(e);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopDrawing();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(e);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
