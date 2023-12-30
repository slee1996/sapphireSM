export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  // Decode Base64 string
  const byteCharacters = atob(base64);

  // Create an array of bytes
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  // Convert to a Byte Array
  const byteArray = new Uint8Array(byteNumbers);

  // Create and return a Blob
  return new Blob([byteArray], { type: mimeType });
};
