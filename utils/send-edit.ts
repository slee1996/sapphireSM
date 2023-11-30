interface EditImageParams {
  image: string;
  mask: string;
  prompt: string;
  setImageEdits: (edits: any) => void;
  setLoading: (loading: any) => void;
}

export const sendEdit = async ({
  image,
  mask,
  prompt,
  setImageEdits,
  setLoading,
}: EditImageParams) => {
  setLoading(true);

  try {
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

    const blobbedResults = fixedResult.data.map((image: any) => {
      // Convert base64 string to a blob
      const byteCharacters = atob(
        `data:image/jpeg;base64,${image.b64_json}`.split(",")[1]
      );
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: "image/jpeg" }); // Adjust the MIME type as needed
      return URL.createObjectURL(blob);
    });

    setLoading(false);
    setImageEdits(blobbedResults);
  } catch (error) {
    console.error("Error in sendEdit:", error);
    setLoading(false);
  }
};
