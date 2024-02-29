"use client";
import React, { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/indexed-db/db";
import { useSearchParams } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const blobToBase64 = (blob: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
  });
};

export default function EditHistory({
  setImageToEdit,
}: {
  setImageToEdit: any;
}) {
  const history = useLiveQuery(() => db.imageHistory.toArray());
  const [base64Images, setBase64Images] = useState({}); // thumbnails
  const [base64HistoryImages, setBase64HistoryImages] = useState<any[]>([]);
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
      const currentImage = history?.find((image) => image.id === imageKey);
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
    <div className="w-full bg-black text-white rounded-lg shadow-xl my-4 p-4">
      <h2>Image History</h2>
      {history?.map((image, i) => (
        <div key={i} className="flex flex-row">
          <div>
            <span>Original Image</span>
            {/* @ts-ignore */}
            <img src={base64Images[image.id]} alt="" />
          </div>
          {imageKey && imageKey === image.id && (
            <div>
              <h3>Edit History</h3>
              <div className="flex flex-row w-full">
                {base64HistoryImages.map((imgChild, idx) => (
                  <div key={idx}>
                    <HoverCard>
                      <HoverCardTrigger>
                        <img
                          src={imgChild}
                          alt={`History ${idx + 1}`}
                          className="h-20 w-32"
                        />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <img src={imgChild} alt={`History ${idx + 1}`} />
                        <button
                          className="border p-1 rounded-full"
                          onClick={() => {
                            setImageToEdit(imgChild, image.id);
                          }}
                        >
                          click to restore to this state
                        </button>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
