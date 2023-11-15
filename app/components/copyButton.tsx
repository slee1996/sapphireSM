"use client";
import React, { useState } from "react";

function copyToClipboard(text: any, setCopied: any) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Text copied to clipboard");
      setCopied(true);
      setTimeout(() => setCopied(false), 800); // Reset after 3 seconds
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}

export function CopyButton({ valueToCopy }: { valueToCopy: any }) {
  const [copied, setCopied] = useState(false);

  return (
    <button onClick={() => copyToClipboard(valueToCopy, setCopied)}>
      {copied ? "Copied!" : "Copy prompt to clipboard"}
    </button>
  );
}
