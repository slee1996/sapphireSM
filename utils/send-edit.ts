import { flipAlphaChannel } from "./flip-alpha-channel";

export const sendEdit = async ({
  image,
  mask,
  prompt,
  setImageEdits,
}: {
  image: any;
  mask: any;
  prompt: any;
  setImageEdits: any;
}) => {
  const result = await fetch(`/api/edit-image`, {
    method: "POST",
    body: JSON.stringify({
      image: image.current.toDataURL(),
      mask: mask.current.toDataURL(),
      prompt,
    }),
  });
  const fixedResult = await result.json();

  setImageEdits(fixedResult.data);
};
