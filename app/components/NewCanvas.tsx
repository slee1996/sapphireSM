"use client";
import { useRef, useEffect, useState } from "react";
import { testImg } from "@/constants/test-img";
import { drawImageScaled } from "@/utils/draw-utils";
import { CommandBar } from "./CommandBar";
import {
  drawFrame,
  Frame,
  continueRepositioning,
  startRepositioning,
} from "@/utils/frame-utils";
import { getMousePos } from "@/utils/get-mouse-pos";

export const NewCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(300);
  const [positionY, setPositionY] = useState(0);
  const [imgDimensions, setImgDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [frame, setFrame] = useState<Frame>({
    x: positionX,
    y: positionY + 300,
    width: 300,
    height: 300,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDragStart, setImageDragStart] = useState({ x: 0, y: 0 });
  const [frameHover, setFrameHover] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const imageRef = useRef<HTMLImageElement>();
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    const draw = () => {
      if (context && imageRef.current) {
        drawImageScaled({
          img: imageRef.current,
          ctx: context,
          zoom,
          positionX,
          positionY,
          imageHover,
        });
        drawFrame({ frame, maskContext: context, frameHover });
      }
    };

    if (!imageRef.current) {
      imageRef.current = new Image();
      imageRef.current.onload = () => {
        setImgDimensions({
          width: imageRef.current?.width || 1792,
          height: imageRef.current?.height || 1024,
        });
        draw();
      };
      imageRef.current.src = testImg;
    } else if (imageRef.current.src !== testImg) {
      imageRef.current.onload = () => {
        setImgDimensions({
          width: imageRef.current?.width || 1792,
          height: imageRef.current?.height || 1024,
        });
        draw();
      };
      imageRef.current.src = testImg;
    } else if (context && imageRef.current.complete) {
      setImgDimensions({
        width: imageRef.current.width,
        height: imageRef.current.height,
      });
      draw();
    }

    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
      }
    };
  }, [zoom, frame, positionX, positionY, frameHover, imageHover]);

  const zoomFunc = (zoomFactor: number) => {
    setZoom(zoom * zoomFactor);
  };

  const checkHover = (e: any) => {
    if (isDrawing) return;
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

      let centerShift_x =
        (canvasRef.current.width - scaledWidth) / 2 - positionX;
      let centerShift_y =
        (canvasRef.current.height - scaledHeight) / 2 - positionY;

      if (
        x >= frame.x &&
        x <= frame.x + frame.width &&
        y >= frame.y &&
        y <= frame.y + frame.height
      ) {
        setFrameHover(true);
        setImageHover(false);
        return { imageHover: false, frameHover: true };
      } else if (
        x >= centerShift_x &&
        x <= centerShift_x + scaledWidth &&
        y >= centerShift_y &&
        y <= centerShift_y + scaledHeight
      ) {
        setFrameHover(false);
        setImageHover(true);
        return { imageHover: true, frameHover: false };
      } else {
        setFrameHover(false);
        setImageHover(false);
        return { imageHover: false, frameHover: false };
      }
    }
  };

  const startDrawing = ({ nativeEvent }: { nativeEvent: any }) => {
    if (!isDrawing) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let x, y;

      if (nativeEvent.touches) {
        x = nativeEvent.touches[0].clientX;
        y = nativeEvent.touches[0].clientY;
      } else {
        x = nativeEvent.clientX;
        y = nativeEvent.clientY;
      }

      const { x: scaledX, y: scaledY } = getMousePos({ canvas, x, y });
      setStartPoint({ x: scaledX, y: scaledY });

      const context = canvas.getContext("2d");
      if (context) {
        context.beginPath();
        context.moveTo(scaledX, scaledY);
        // setIsDrawing(true);
      }
    }
  };

  const draw = ({ nativeEvent }: { nativeEvent: any }) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let x, y;

    if (nativeEvent.touches) {
      // For touch devices
      x = nativeEvent.touches[0].clientX;
      y = nativeEvent.touches[0].clientY;
    } else {
      // For mouse events
      x = nativeEvent.clientX;
      y = nativeEvent.clientY;
    }

    const { x: scaledX, y: scaledY } = getMousePos({ canvas, x, y });
    const context = canvas.getContext("2d");

    if (context) {
      context.lineTo(scaledX, scaledY);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (context) {
      // Use the scaled startPoint here
      context.lineTo(startPoint.x, startPoint.y);
      context.closePath();

      context.globalCompositeOperation = "destination-out";

      context.stroke();
      context.fill();

      context.globalCompositeOperation = "source-over";
    }
  };

  return (
    <div className='flex flex-col space-y-4 sm:space-y-0 md:flex-row md:space-x-4 my-2'>
      <div className='relative'>
        <CommandBar
          zoom={zoomFunc}
          setFrame={setFrame}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
        />
        <canvas
          ref={canvasRef}
          className={`w-full touch-none bg-grid bg-contain bg-center bg-repeat border border-dashed border-white rounded-lg box-border
          ${
            frameHover || imageHover
              ? isDragging || isDraggingImage
                ? " cursor-grabbing"
                : " cursor-grab"
              : isDrawing
              ? " cursor-crosshair"
              : null
          }
          `}
          onMouseDown={(e) => {
            const hoverStatus = checkHover(e);

            if (isDrawing) {
              startDrawing(e);
              return;
            }

            if (hoverStatus?.imageHover) {
              setIsDraggingImage(true);
              setImageDragStart(
                getMousePos({
                  canvas: canvasRef.current,
                  x: e.clientX,
                  y: e.clientY,
                })
              );
            } else if (hoverStatus?.frameHover) {
              startRepositioning({
                e,
                canvasRef,
                frame,
                setIsDragging,
                setDragStart,
              });
            }
          }}
          onMouseEnter={checkHover}
          onMouseUp={() => {
            setIsDragging(false);
            setIsDraggingImage(false);
            stopDrawing();
          }}
          onMouseOut={() => {
            setIsDragging(false);
            setIsDraggingImage(false);
            setFrameHover(false);
            setImageHover(false);
            stopDrawing();
          }}
          onMouseMove={(e) => {
            checkHover(e);

            if (isDrawing) {
              draw(e);
              return;
            }

            if (isDraggingImage) {
              const newPos = getMousePos({
                canvas: canvasRef.current,
                x: e.clientX,
                y: e.clientY,
              });
              const deltaX = newPos.x - imageDragStart.x;
              const deltaY = newPos.y - imageDragStart.y;
              setPositionX(positionX - deltaX);
              setPositionY(positionY - deltaY);
              setImageDragStart(newPos);

              setFrame((prevFrame) => ({
                ...prevFrame,
                x: prevFrame.x + deltaX,
                y: prevFrame.y + deltaY,
              }));
            } else if (isDragging) {
              continueRepositioning({
                e,
                isDragging,
                canvasRef,
                setFrame,
                frame,
                dragStart,
                imgDimensions,
                zoom,
                positionX,
                positionY,
              });
            }
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const hoverStatus = checkHover({
              clientX: touch.clientX,
              clientY: touch.clientY,
              nativeEvent: e.nativeEvent,
            });

            if (hoverStatus?.imageHover) {
              setIsDraggingImage(true);
              setImageDragStart(
                getMousePos({
                  canvas: canvasRef.current,
                  x: touch.clientX,
                  y: touch.clientY,
                })
              );
            } else if (hoverStatus?.frameHover) {
              startRepositioning({
                e,
                canvasRef,
                frame,
                setIsDragging,
                setDragStart,
              });
            }
          }}
          onTouchEnd={(e) => {
            const touch = e.touches[0];
            const hoverStatus = checkHover({
              clientX: touch.clientX,
              clientY: touch.clientY,
              nativeEvent: e.nativeEvent,
            });
            setIsDragging(false);
            setIsDraggingImage(false);
            setFrameHover(false);
            setImageHover(false);
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];

            if (isDraggingImage) {
              const newPos = getMousePos({
                canvas: canvasRef.current,
                x: touch.clientX,
                y: touch.clientY,
              });
              const deltaX = newPos.x - imageDragStart.x;
              const deltaY = newPos.y - imageDragStart.y;

              setPositionX(positionX - deltaX);
              setPositionY(positionY - deltaY);
              setImageDragStart(newPos);

              setFrame((prevFrame) => ({
                ...prevFrame,
                x: prevFrame.x + deltaX,
                y: prevFrame.y + deltaY,
              }));
            } else if (isDragging) {
              continueRepositioning({
                e,
                isDragging,
                canvasRef,
                setFrame,
                frame,
                dragStart,
                imgDimensions,
                zoom,
                positionX,
                positionY,
              });
            }
          }}
          width='1792'
          height='1024'
        />

        <div className='bg-black rounded-xl absolute top-0 right-0 p-2 m-1 w-1/5 h-5/6'>
          Image Edits
        </div>
      </div>
    </div>
  );
};
