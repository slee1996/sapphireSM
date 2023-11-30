interface DrawImageProps {
  img: any;
  ctx: any;
  width: any;
  height: any;
  position: { x: number; y: number };
}

export const drawImageNew = ({
  img,
  ctx,
  width = 1792,
  height = 1024,
  position,
}: DrawImageProps) => {
  const canvas = ctx.canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0, img.width, img.height, position.x, position.y, width, height);
};
