export const drawImageScaled = ({
  img,
  ctx,
  zoom = 1,
  positionX,
  positionY,
  alpha = 0.7,
  imageHover,
}: {
  img: any;
  ctx: any;
  zoom: any;
  positionX: any;
  positionY: any;
  alpha?: number;
  imageHover: boolean;
}) => {
  const canvas = ctx.canvas;

  let hRatio = (canvas.width / img.width / 2) * zoom;
  let vRatio = (canvas.height / img.height / 2) * zoom;
  let ratio = Math.min(hRatio, vRatio);

  let scaledWidth = img.width * ratio;
  let scaledHeight = img.height * ratio;

  let centerShift_x = (canvas.width - scaledWidth) / 2 - positionX;
  let centerShift_y = (canvas.height - scaledHeight) / 2 - positionY;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (imageHover) {
    ctx.globalAlpha = alpha;
  }

  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    centerShift_x,
    centerShift_y,
    scaledWidth,
    scaledHeight
  );
  ctx.globalAlpha = 1;
};
