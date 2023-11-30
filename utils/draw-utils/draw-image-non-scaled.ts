export const drawImageNonScaled = ({
  img,
  ctx,
  positionX,
  positionY,
  alpha = 1, // Default to fully opaque if not specified
  imageHover,
}: {
  img: any;
  ctx: any;
  positionX: any;
  positionY: any;
  alpha?: number;
  imageHover: boolean;
}) => {
  // Clear the canvas before drawing
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Apply alpha transparency if imageHover is true
  if (imageHover) {
    ctx.globalAlpha = alpha;
  }

  // Draw the image at its original size at the specified position
  ctx.drawImage(img, 0, 0);

  // Reset globalAlpha to 1 for subsequent drawing operations
  ctx.globalAlpha = 1;
};
