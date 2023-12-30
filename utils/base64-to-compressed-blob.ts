import Pica from "pica";

const pica = Pica();

interface CreateThumbnailBlobI {
  base64Data: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
}

// Function to create a thumbnail blob
export const createThumbnailBlob = async ({
  base64Data,
  thumbnailWidth,
  thumbnailHeight,
}: CreateThumbnailBlobI) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Data}`;
    img.onload = () => {
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = thumbnailWidth; // Set thumbnail width
      offscreenCanvas.height = thumbnailHeight; // Set thumbnail height

      pica
        .resize(img, offscreenCanvas)
        .then((resized: any) => pica.toBlob(resized, "image/jpeg", 0.9))
        .then(resolve)
        .catch(reject);
    };
    img.onerror = reject;
  });
};
