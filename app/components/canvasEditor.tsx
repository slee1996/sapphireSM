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

  const startRepositioning = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (maskCanvasRef.current) {
      const rect = maskCanvasRef.current.getBoundingClientRect();
      let x, y;

      // Check if it's a touch event
      if (e.nativeEvent instanceof TouchEvent) {
        const touch = e.nativeEvent.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
      } else {
        // It's a mouse event
        x = (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left;
        y = (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top;
      }

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

  const continueRepositioning = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDragging) return;

    if (maskCanvasRef.current) {
      const rect = maskCanvasRef.current.getBoundingClientRect();
      let x, y;

      // Check if it's a touch event
      if (e.nativeEvent instanceof TouchEvent) {
        // Use the first touch point
        const touch = e.nativeEvent.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
      } else {
        // It's a mouse event
        x = (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left;
        y = (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top;
      }

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
    let x, y;

    if (nativeEvent.touches) {
      x =
        nativeEvent.touches[0].clientX -
        nativeEvent.target.getBoundingClientRect().left;
      y =
        nativeEvent.touches[0].clientY -
        nativeEvent.target.getBoundingClientRect().top;
    } else {
      x = nativeEvent.offsetX;
      y = nativeEvent.offsetY;
    }

    setStartPoint({ x, y });

    if (maskCanvasRef.current) {
      const context = maskCanvasRef.current.getContext("2d");
      if (context) {
        context.beginPath();
        context.moveTo(x, y);
        setIsDrawing(true);
      }
    }
  };

  const draw = ({ nativeEvent }: { nativeEvent: any }) => {
    if (!isDrawing) {
      return;
    }

    let x, y;

    if (nativeEvent.touches) {
      x =
        nativeEvent.touches[0].clientX -
        nativeEvent.target.getBoundingClientRect().left;
      y =
        nativeEvent.touches[0].clientY -
        nativeEvent.target.getBoundingClientRect().top;
    } else {
      x = nativeEvent.offsetX;
      y = nativeEvent.offsetY;
    }

    if (maskCanvasRef.current) {
      const context = maskCanvasRef.current.getContext("2d");
      if (context) {
        context.lineTo(x, y);
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
        that you want erased for inpainting. On mobile you can move the frame using two fingers.
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
            className='absolute top-0 left-0 pb-10 touch-none'
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          <canvas
            ref={maskCanvasRef}
            width={width}
            height={height}
            className='absolute top-0 left-0 pb-10 touch-none'
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.shiftKey) {
                startRepositioning(e);
              } else {
                startDrawing(e);
              }
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.shiftKey) {
                handleMouseUp();
              } else {
                stopDrawing();
              }
            }}
            onMouseOut={() => stopDrawing()}
            onMouseMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.shiftKey) {
                continueRepositioning(e);
              } else {
                draw(e);
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.touches.length === 2) {
                startRepositioning(e);
                return;
              } else if (e.touches.length === 1) {
                startDrawing(e);
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.touches.length === 2) {
                handleMouseUp();
                return;
              } else if (e.touches.length === 1) {
                stopDrawing();
              }
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.touches.length === 2) {
                continueRepositioning(e);
                return;
              } else if (e.touches.length === 1) {
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
