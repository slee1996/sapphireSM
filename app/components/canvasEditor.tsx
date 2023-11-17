import { default as ImageComponent } from "next/image";
import React, { useRef, useEffect, useState } from "react";

function flipAlphaChannel(canvas: any) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data; // RGBA values array

  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = 255 - data[i + 3]; // Invert the alpha channel
  }

  ctx.putImageData(imageData, 0, 0);
}

async function sendEdit({
  image,
  mask,
  prompt,
  setEditedImage,
}: {
  image: any;
  mask: any;
  prompt: any;
  setEditedImage: any;
}) {
  flipAlphaChannel(mask.current);

  const result = await fetch(`/api/edit-image`, {
    method: "POST",
    body: JSON.stringify({
      image: image.current.toDataURL(),
      mask: mask.current.toDataURL(),
      prompt,
    }),
  });
  const fixedResult = await result.json();

  setEditedImage(fixedResult.data[0].url);
}

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
  const [editedImage, setEditedImage] = useState<any>(null);

  useEffect(() => {
    // Get the canvas context
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    // Create a new image object
    const image = new Image();

    // Set the source of the image
    image.src = src;

    // Draw the image onto the canvas once it's loaded
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    // Optionally, clean up on unmount
    return () => {
      image.onload = null;
    };
  }, [src]); // Re-run this effect if the src prop changes

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

  const stopDrawing = ({ nativeEvent }: { nativeEvent: any }) => {
    if (!isDrawing) {
      return;
    }
    const context = maskCanvasRef.current.getContext("2d");
    context.lineTo(startPoint.x, startPoint.y); // Draw a line back to the start point
    context.closePath(); // Close the path
    context.stroke();
    context.fill();
    setIsDrawing(false);
  };

  return (
    <div>
      <div>
        {editedImage ? (
          <div>
            Edited Image
            <ImageComponent src={editedImage} width={400} height={400} alt='' />
          </div>
        ) : null}
        Image Edit Prompt
        <textarea
          value={imageEditPrompt}
          className='text-black w-full'
          onChange={(e) => setImageEditPrompt(e.target.value)}
        />
        <button
          onClick={() => {
            sendEdit({
              image: canvasRef,
              mask: maskCanvasRef,
              prompt: imageEditPrompt,
              setEditedImage,
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
      {/* {editedImage ? (
        <div>
          Edited Image
          <ImageComponent src={editedImage} width={400} height={400} alt='' />
        </div>
      ) : null} */}
    </div>
  );
};

export default CanvasEditor;
