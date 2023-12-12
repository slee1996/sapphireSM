"use client";
import { useRef, useEffect, useState } from "react";
import { drawImageScaled, drawImageNonScaled } from "@/utils/draw-utils";
import { CommandBar } from "./CommandBar";
import {
  captureFrameContent,
  drawFrame,
  drawFrameScaled,
  Frame,
  continueRepositioning,
  startRepositioning,
  pasteIntoFrame,
} from "@/utils/frame-utils";
import { getMousePos } from "@/utils/get-mouse-pos";
import { checkHover } from "@/utils/check-hover";
import { sendEdit } from "@/utils/send-edit";
import { default as ImageComponent } from "next/image";
import { drawImageNew } from "@/utils/draw-utils/draw-image-new";

function generateUniqueId(base64String: string) {
  let hash = 5381;
  let char;

  for (let i = 0; i < base64String.length; i++) {
    char = base64String.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + c */
  }

  return hash;
}

const blobToBase64 = (blob: any) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
  });
};

export const NewCanvas = ({
  testImg,
  setTestImg,
}: {
  testImg: any;
  setTestImg: any;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [imgDimensions, setImgDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [frame, setFrame] = useState<Frame>({
    x: positionX,
    y: positionY,
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
  const [toggleEraser, setToggleEraser] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [lastEraserPos, setLastEraserPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [drawingImage, setDrawingImage] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [imageEdits, setImageEdits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState(null);
  const [scaledFrame, setScaledFrame] = useState({
    positionX: 0,
    positionY: 0,
    frameWidth: 0,
    frameHeight: 0,
  });
  const base64Cache = new Map();

  useEffect(() => {
    setImageEdits([]);
  }, [testImg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    const context = canvas?.getContext("2d");
    const offscreenContext = offscreenCanvas?.getContext("2d");

    const draw = () => {
      if (context && offscreenContext && imageRef.current) {
        let hRatio = (context.canvas.width / imageRef.current.width / 2) * zoom;
        let vRatio =
          (context.canvas.height / imageRef.current.height / 2) * zoom;
        let ratio = Math.min(hRatio, vRatio);
        let inverseRatio = 1 / ratio;

        let scaledWidth = imageRef.current.width * ratio;
        let scaledHeight = imageRef.current.height * ratio;
        let centerShift_x =
          (context.canvas.width - scaledWidth) / 2 - positionX;
        let centerShift_y =
          (context.canvas.height - scaledHeight) / 2 - positionY;

        let imageLeft = (context.canvas.width - scaledWidth) / 2 - positionX;
        let imageTop = (context.canvas.height - scaledHeight) / 2 - positionY;

        drawImageNew({
          img: imageRef.current,
          ctx: context,
          width: scaledWidth,
          height: scaledHeight,
          position: {
            x: centerShift_x,
            y: centerShift_y,
          },
        });

        drawFrame({ frame, maskContext: context, frameHover });

        if (!isDragging && !isDraggingImage) {
          drawImageNonScaled({
            img: imageRef.current,
            ctx: offscreenContext,
            positionX,
            positionY,
            imageHover,
          });
          const scaled = drawFrameScaled({
            frame,
            maskContext: offscreenContext,
            frameHover,
            img: imageRef.current,
            zoom,
            positionX: (frame.x - imageLeft) * inverseRatio,
            positionY: (frame.y - imageTop) * inverseRatio,
            onscreenCanvas: context,
          });
          if (scaled) {
            setScaledFrame(scaled);
          }
        }
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
      return;
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
  }, [
    zoom,
    frame,
    positionX,
    positionY,
    frameHover,
    imageHover,
    isDragging,
    isDraggingImage,
    testImg,
    canvasDataUrl,
  ]);

  const zoomFunc = (zoomFactor: number) => {
    setZoom(zoom * zoomFactor);
  };

  const captureHandler = async () => {
    setLoading(true);

    const imagesToSend = await captureFrameContent({
      canvasRef: offscreenCanvasRef,
      maskCanvasRef: canvasRef,
      frame,
      img: imageRef.current,
      zoom,
      positionX: scaledFrame.positionX,
      positionY: scaledFrame.positionY,
      scaledFrame,
    });

    sendEdit({
      image: imagesToSend?.mainDataURL as string,
      mask: imagesToSend?.maskDataURL as string,
      prompt: editPrompt,
      setImageEdits,
      setLoading,
    });
  };

  const pasteAndDownload = (download = true) => {
    const canvas = offscreenCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (context) {
      const imageData = context.getImageData(positionX, positionY, 1792, 1024);

      // Create a new canvas to draw the image data
      const downloadCanvas = document.createElement("canvas");
      downloadCanvas.width = imageData.width;
      downloadCanvas.height = imageData.height;
      const downloadCtx = downloadCanvas.getContext("2d");
      downloadCtx?.putImageData(imageData, 0, 0);

      // Convert canvas to Blob
      downloadCanvas.toBlob((blob: any) => {
        const url = URL.createObjectURL(blob);
        blobToBase64(blob).then((base64) => {
          setTestImg({ url: base64, prompt: "" });
        });
        if (!download) return;
        // Create a temporary link to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = "downloaded_image.png"; // Specify the file name for download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url); // Clean up the URL
      }, "image/png");
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 md:flex-row md:space-x-4 my-2">
      <div className="relative">
        <CommandBar
          zoom={zoomFunc}
          setFrame={setFrame}
          isDrawing={toggleEraser}
          setIsDrawing={setToggleEraser}
          editPrompt={editPrompt}
          setEditPrompt={setEditPrompt}
          captureHandler={captureHandler}
        />
        <canvas
          ref={offscreenCanvasRef}
          className="absolute -left-[10000px] top-0"
          width="1792"
          height="1024"
        />
        <canvas
          ref={canvasRef}
          className={`w-full touch-none bg-grid bg-contain bg-center bg-repeat border border-dashed border-white rounded-lg box-border
          ${
            frameHover || imageHover
              ? isDragging || isDraggingImage
                ? " cursor-grabbing"
                : " cursor-grab"
              : toggleEraser
              ? " cursor-crosshair"
              : null
          }
          `}
          onMouseDown={(e) => {
            // if (imageEdits.length > 0) return;
            if (toggleEraser) {
              setIsErasing(true);
              const pos = getMousePos({
                canvas: canvasRef.current,
                x: e.clientX,
                y: e.clientY,
              });
              setStartPoint(pos);

              const context = canvasRef.current?.getContext("2d");
              const offscreenContext =
                offscreenCanvasRef.current?.getContext("2d");

              if (context && offscreenContext && imageRef.current) {
                let imageWidthRatio =
                  context.canvas.width / (imageRef.current.width / 2);

                let hRatio =
                  (context.canvas.width / imageRef.current.width / 2) * zoom;
                let vRatio =
                  (context.canvas.height / imageRef.current.height / 2) * zoom;
                let ratio = Math.min(hRatio, vRatio);
                let inverseRatio = 1 / ratio;

                let scaledWidth = imgDimensions.width * ratio;
                let scaledHeight = imgDimensions.height * ratio;

                let imageLeft = (context.canvas.width - scaledWidth) / 2;
                let imageTop = (context.canvas.height - scaledHeight) / 2;

                context.globalCompositeOperation = "destination-out";
                offscreenContext.globalCompositeOperation = "destination-out";

                context.beginPath();
                offscreenContext.beginPath();

                const eraserRadius = 15;

                context.arc(pos.x, pos.y, eraserRadius, 0, Math.PI * 2);

                let newOffscreenX = (pos.x - imageLeft) * inverseRatio;
                let newOffscreenY = (pos.y - imageTop) * inverseRatio;

                offscreenContext.arc(
                  newOffscreenX,
                  newOffscreenY,
                  eraserRadius * inverseRatio, // Adjust the eraser size according to the scale
                  0,
                  Math.PI * 2
                );

                context.fill();
                offscreenContext.fill();
              }

              return;
            }

            const hoverStatus = toggleEraser
              ? { imageHover: false, frameHover: false }
              : checkHover(
                  e,
                  canvasRef,
                  imgDimensions,
                  frame,
                  zoom,
                  positionX,
                  positionY
                );
            setImageHover(false);
            setFrameHover(hoverStatus?.frameHover ?? false);

            // if (hoverStatus?.imageHover) {
            //   setIsDraggingImage(true);
            //   setImageDragStart(
            //     getMousePos({
            //       canvas: canvasRef.current,
            //       x: e.clientX,
            //       y: e.clientY,
            //     })
            //   );
            // } else

            if (hoverStatus?.frameHover) {
              startRepositioning({
                e,
                canvasRef,
                frame,
                setIsDragging,
                setDragStart,
              });
            }
          }}
          onMouseEnter={(e) => {
            const hoverStatus = toggleEraser
              ? { imageHover: false, frameHover: false }
              : checkHover(
                  e,
                  canvasRef,
                  imgDimensions,
                  frame,
                  zoom,
                  positionX,
                  positionY
                );
            setImageHover(false);
            setFrameHover(hoverStatus?.frameHover ?? false);
          }}
          onMouseUp={() => {
            // if (imageEdits.length > 0) return;
            if (isErasing) {
              setIsErasing(false);
              setLastEraserPos({ x: 0, y: 0 });

              const context = canvasRef.current?.getContext("2d");
              const offscreenContext =
                offscreenCanvasRef.current?.getContext("2d");
              if (context && offscreenContext) {
                context.globalCompositeOperation = "source-over";
                offscreenContext.globalCompositeOperation = "source-over";
              }
              const currentDrawing = canvasRef.current?.toDataURL();
              const currentDrawing2 = offscreenCanvasRef.current?.toDataURL();

              setDrawingImage(currentDrawing as string);
              return;
            }

            setIsDragging(false);
            setIsDraggingImage(false);
          }}
          onMouseOut={() => {
            // if (imageEdits.length > 0) return;
            if (isErasing) {
              setIsErasing(false);
              setLastEraserPos({ x: 0, y: 0 });

              const context = canvasRef.current?.getContext("2d");
              const offscreenContext =
                offscreenCanvasRef.current?.getContext("2d");

              if (context && offscreenContext) {
                context.globalCompositeOperation = "source-over";
                offscreenContext.globalCompositeOperation = "source-over";
              }
              return;
            }

            setIsDragging(false);
            setIsDraggingImage(false);
            setFrameHover(false);
            setImageHover(false);
          }}
          onMouseMove={(e) => {
            // if (imageEdits.length > 0) return;
            if (isErasing) {
              const newPos = getMousePos({
                canvas: canvasRef.current,
                x: e.clientX,
                y: e.clientY,
              });
              const context = canvasRef.current?.getContext("2d");
              const offscreenContext =
                offscreenCanvasRef.current?.getContext("2d");

              if (context && offscreenContext && imageRef.current) {
                let hRatio =
                  (context.canvas.width / imageRef.current.width / 2) * zoom;
                let vRatio =
                  (context.canvas.height / imageRef.current.height / 2) * zoom;
                let ratio = Math.min(hRatio, vRatio);
                let inverseRatio = 1 / ratio;

                let scaledWidth = imageRef.current.width * ratio;
                let scaledHeight = imageRef.current.height * ratio;

                let imageLeft = (context.canvas.width - scaledWidth) / 2;
                let imageTop = (context.canvas.height - scaledHeight) / 2;

                context.globalCompositeOperation = "destination-out";
                context.lineWidth = 30; // Scale the line width
                offscreenContext.globalCompositeOperation = "destination-out";
                offscreenContext.lineWidth = 30 * inverseRatio; // Scale the line width for the offscreen canvas

                if (lastEraserPos.x !== 0 || lastEraserPos.y !== 0) {
                  // Translate and scale the last eraser position
                  let lastOffscreenX =
                    (lastEraserPos.x - imageLeft) * inverseRatio;
                  let lastOffscreenY =
                    (lastEraserPos.y - imageTop) * inverseRatio;

                  // Translate and scale the new eraser position
                  let newOffscreenX = (newPos.x - imageLeft) * inverseRatio;
                  let newOffscreenY = (newPos.y - imageTop) * inverseRatio;

                  context.beginPath();
                  offscreenContext.beginPath();

                  context.moveTo(lastEraserPos.x, lastEraserPos.y);
                  context.lineTo(newPos.x, newPos.y);
                  context.stroke();

                  offscreenContext.moveTo(lastOffscreenX, lastOffscreenY);
                  offscreenContext.lineTo(newOffscreenX, newOffscreenY);
                  offscreenContext.stroke();
                }

                // Eraser circle on the main canvas
                context.beginPath();
                context.arc(newPos.x, newPos.y, 15, 0, Math.PI * 2);
                context.fill();

                // Eraser circle on the offscreen canvas
                offscreenContext.beginPath();
                let offscreenEraserX = (newPos.x - imageLeft) * inverseRatio;
                let offscreenEraserY = (newPos.y - imageTop) * inverseRatio;
                offscreenContext.arc(
                  offscreenEraserX,
                  offscreenEraserY,
                  15 * inverseRatio, // Scale the eraser size
                  0,
                  Math.PI * 2
                );
                offscreenContext.fill();
              }
              setLastEraserPos(newPos);

              return;
            }

            const hoverStatus = toggleEraser
              ? { imageHover: false, frameHover: false }
              : checkHover(
                  e,
                  canvasRef,
                  imgDimensions,
                  frame,
                  zoom,
                  positionX,
                  positionY
                );
            setImageHover(false);
            setFrameHover(hoverStatus?.frameHover ?? false);

            // if (isDraggingImage) {
            //   const newPos = getMousePos({
            //     canvas: canvasRef.current,
            //     x: e.clientX,
            //     y: e.clientY,
            //   });
            //   const deltaX = newPos.x - imageDragStart.x;
            //   const deltaY = newPos.y - imageDragStart.y;
            //   setPositionX(positionX - deltaX);
            //   setPositionY(positionY - deltaY);
            //   setImageDragStart(newPos);

            //   setFrame((prevFrame) => ({
            //     ...prevFrame,
            //     x: prevFrame.x + deltaX,
            //     y: prevFrame.y + deltaY,
            //   }));
            // } else
            if (isDragging) {
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
            // if (imageEdits.length > 0) return;
            e.preventDefault();
            const touch = e.touches[0];

            if (toggleEraser) {
              setIsErasing(true);
              const pos = getMousePos({
                canvas: canvasRef.current,
                x: touch.clientX,
                y: touch.clientY,
              });
              setStartPoint(pos);

              const context = canvasRef.current?.getContext("2d");
              if (context) {
                context.globalCompositeOperation = "destination-out";
                context.beginPath();

                const eraserRadius = 15;

                context.arc(pos.x, pos.y, eraserRadius, 0, Math.PI * 2);

                context.fill();
              }

              return;
            }

            const hoverStatus = toggleEraser
              ? { imageHover: false, frameHover: false }
              : checkHover(
                  e,
                  canvasRef,
                  imgDimensions,
                  frame,
                  zoom,
                  positionX,
                  positionY
                );
            setImageHover(false);
            setFrameHover(hoverStatus?.frameHover ?? false);

            // if (hoverStatus?.imageHover) {
            //   setIsDraggingImage(true);
            //   setImageDragStart(
            //     getMousePos({
            //       canvas: canvasRef.current,
            //       x: touch.clientX,
            //       y: touch.clientY,
            //     })
            //   );
            // } else
            if (hoverStatus?.frameHover) {
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
            // if (imageEdits.length > 0) return;
            if (isErasing) {
              setIsErasing(false);
              setLastEraserPos({ x: 0, y: 0 });

              const context = canvasRef.current?.getContext("2d");
              if (context) {
                context.globalCompositeOperation = "source-over";
              }
              return;
            }

            setIsDragging(false);
            setIsDraggingImage(false);
            setFrameHover(false);
            setImageHover(false);
          }}
          onTouchMove={(e) => {
            // if (imageEdits.length > 0) return;
            const touch = e.touches[0];

            if (isErasing) {
              const newPos = getMousePos({
                canvas: canvasRef.current,
                x: touch.clientX,
                y: touch.clientY,
              });
              const context = canvasRef.current?.getContext("2d");
              if (context) {
                const eraserPosSet =
                  lastEraserPos.x === 0 && lastEraserPos.y === 0;
                context.globalCompositeOperation = "destination-out";

                if (!eraserPosSet) {
                  context.lineWidth = 15;
                  context.moveTo(lastEraserPos.x, lastEraserPos.y);
                  context.lineTo(newPos.x, newPos.y);
                  context.stroke();
                }

                context.beginPath();
                context.arc(newPos.x, newPos.y, 15, 0, Math.PI * 2);
                context.fill();
              }
              setLastEraserPos(newPos);
              return;
            }

            // if (isDraggingImage) {
            //   const newPos = getMousePos({
            //     canvas: canvasRef.current,
            //     x: touch.clientX,
            //     y: touch.clientY,
            //   });
            //   const deltaX = newPos.x - imageDragStart.x;
            //   const deltaY = newPos.y - imageDragStart.y;

            //   setPositionX(positionX - deltaX);
            //   setPositionY(positionY - deltaY);
            //   setImageDragStart(newPos);

            //   setFrame((prevFrame) => ({
            //     ...prevFrame,
            //     x: prevFrame.x + deltaX,
            //     y: prevFrame.y + deltaY,
            //   }));
            // } else
            if (isDragging) {
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
          width="1792"
          height="1024"
        />

        <div className="bg-black rounded-xl md:absolute md:top-0 md:right-0 p-2 m-1 md:w-1/5 md:h-5/6 overflow-y-scroll">
          Image Edits
          {loading ? "Loading..." : null}
          {imageEdits.length > 0
            ? imageEdits.map((i: any, k: any) => (
                <div key={k}>
                  <button
                    className="cursor-pointer"
                    onClick={async () => {
                      await pasteIntoFrame({
                        imageUrl: i,
                        canvasRef: offscreenCanvasRef,
                        frame: {
                          x: scaledFrame.positionX,
                          y: scaledFrame.positionY,
                          width: scaledFrame.frameWidth,
                          height: scaledFrame.frameHeight,
                        },
                      });
                      pasteAndDownload();
                    }}
                  >
                    Click to paste edit and download (hover over image below to
                    preview)
                  </button>
                  <button
                    className="cursor-pointer"
                    onClick={async () => {
                      await pasteIntoFrame({
                        imageUrl: i,
                        canvasRef: offscreenCanvasRef,
                        frame: {
                          x: scaledFrame.positionX,
                          y: scaledFrame.positionY,
                          width: scaledFrame.frameWidth,
                          height: scaledFrame.frameHeight,
                        },
                      });
                      pasteAndDownload(false);
                    }}
                  >
                    Click to paste edit and continue editing
                  </button>
                  <ImageComponent
                    className="hover:border-yellow-400 hover:border-2"
                    src={i}
                    width={1792}
                    height={1024}
                    alt=""
                    onMouseEnter={() => {
                      const uniqueId = generateUniqueId(i); 
                      if (!base64Cache.has(uniqueId)) {
                        base64Cache.set(uniqueId, i);
                      }
                      pasteIntoFrame({
                        imageUrl: base64Cache.get(uniqueId),
                        canvasRef,
                        frame,
                      });
                    }}
                    onMouseOut={() => {
                      const canvas = canvasRef.current;
                      const offscreenCanvas = offscreenCanvasRef.current;
                      const context = canvas?.getContext("2d");

                      if (context && imageRef.current) {
                        let hRatio =
                          (context.canvas.width / imageRef.current.width / 2) *
                          zoom;
                        let vRatio =
                          (context.canvas.height /
                            imageRef.current.height /
                            2) *
                          zoom;
                        let ratio = Math.min(hRatio, vRatio);

                        let scaledWidth = imageRef.current.width * ratio;
                        let scaledHeight = imageRef.current.height * ratio;
                        let centerShift_x =
                          (context.canvas.width - scaledWidth) / 2 - positionX;
                        let centerShift_y =
                          (context.canvas.height - scaledHeight) / 2 -
                          positionY;

                        drawImageNew({
                          img: imageRef.current,
                          ctx: context,
                          width: scaledWidth,
                          height: scaledHeight,
                          position: {
                            x: centerShift_x,
                            y: centerShift_y,
                          },
                        });

                        drawFrame({ frame, maskContext: context, frameHover });
                      }
                    }}
                  />
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};
