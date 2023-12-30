"use client";
import React, { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/indexed-db/db";
import { useSearchParams } from "next/navigation";

const blobToBase64 = (blob: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
  });
};

export default function EditHistory() {
  const history = useLiveQuery(() => db.imageHistory.toArray());
  const [base64Images, setBase64Images] = useState({}); // thumbnails
  const [base64HistoryImages, setBase64HistoryImages] = useState([]);
  const searchParams = useSearchParams();
  const imageKey = searchParams.get("imageKey");

  useEffect(() => {
    const loadImages = async () => {
      const newBase64Images = {};
      for (const image of history || []) {
        const base64 = await blobToBase64(image.currentThumbnail);
        // @ts-ignore
        newBase64Images[image.id] = base64;
      }
      setBase64Images(newBase64Images);
      if (imageKey) {
        await loadCurrentImageHistory();
      }
    };

    const loadCurrentImageHistory = async () => {
      const currentImage = history?.find(
        (image) => image.id === Number(imageKey)
      );
      const historyBase64 = [];
      for (const image of currentImage?.history || []) {
        const base64 = await blobToBase64(image);
        historyBase64.push(base64);
      }
      setBase64HistoryImages(historyBase64);
    };

    if (history) {
      loadImages();
    }
  }, [history, imageKey]);

  return (
    <div>
      <h2>Edit History</h2>
      {history?.map((image, i) => (
        <div key={i}>
          <span>Original Image</span>
          <img src={base64Images[image.id]} alt="" />
          {imageKey && Number(imageKey) === image.id && (
            <div>
              <h3>Image History</h3>
              {base64HistoryImages.map((img, idx) => (
                <div key={idx}>
                  {idx}
                  <img
                    src={img}
                    alt={`History ${idx + 1}`}
                    className="h-20 w-32"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
