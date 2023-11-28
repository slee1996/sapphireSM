import { useState } from "react";
import { Frame } from "@/utils/frame-utils";

interface MoveFrameProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  frame: Frame;
  setFrame: (frame: Frame) => void; // You need a way to update the frame state
}

export const useDraggableFrame = ({
  canvasRef,
  frame,
  setFrame,
}: MoveFrameProps) => {
  // Track whether the mouse is pressed down
  const [isDragging, setIsDragging] = useState(false);
  // Track the initial click position
  const [clickStart, setClickStart] = useState({ x: 0, y: 0 });

  const onMouseDown = (event: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = event.clientX - (rect?.left ?? 0);
    const y = event.clientY - (rect?.top ?? 0);

    // Check if the mouse down is within the frame's boundaries
    if (
      x >= frame.x &&
      x <= frame.x + frame.width &&
      y >= frame.y &&
      y <= frame.y + frame.height
    ) {
      setClickStart({ x, y });
      setIsDragging(true);
    }
  };

  const onMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      const rect = canvasRef.current?.getBoundingClientRect();
      const currentX = event.clientX - (rect?.left ?? 0);
      const currentY = event.clientY - (rect?.top ?? 0);

      // Calculate the new position of the frame
      const deltaX = currentX - clickStart.x;
      const deltaY = currentY - clickStart.y;

      setFrame({
        ...frame,
        x: frame.x + deltaX,
        y: frame.y + deltaY,
      });

      // Update the start position for the next move
      setClickStart({ x: currentX, y: currentY });
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  // Set up the event listeners when the component mounts
  useState(() => {
    const canvas = canvasRef.current;
    canvas?.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    // Clean up the event listeners when the component unmounts
    return () => {
      canvas?.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [canvasRef, frame]);

  // Now the frame should be draggable within the canvas
};
