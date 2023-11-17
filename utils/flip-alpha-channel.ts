export const flipAlphaChannel = (canvas: any) => {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data; // RGBA values array

  for (let i = 0; i < data.length; i += 4) {
    data[i + 3] = 255 - data[i + 3]; // Invert the alpha channel
  }

  ctx.putImageData(imageData, 0, 0);
};
