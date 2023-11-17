import { flipAlphaChannel } from "./flip-alpha-channel";

export const sendEdit = async ({
  image,
  mask,
  prompt,
  setEditedImage,
}: {
  image: any;
  mask: any;
  prompt: any;
  setEditedImage: any;
}) => {
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
};
