interface EditImageParams {
  image: string;
  mask: string;
  prompt: string;
  setImageEdits: (edits: any) => void;
}

export const sendEdit = async ({
  image,
  mask,
  prompt,
  setImageEdits,
}: EditImageParams) => {
  const result = await fetch(`/api/edit-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image,
      mask,
      prompt,
    }),
  });
  const fixedResult = await result.json();

  return setImageEdits(fixedResult.data);
};
