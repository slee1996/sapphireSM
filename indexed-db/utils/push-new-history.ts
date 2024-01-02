import { db } from "../db";

export const pushNewHistory = async (imageId: any, newHistory: Blob) => {
  await db.imageHistory
    .where("id")
    .equals(imageId)
    .modify((image) => {
      image.current = newHistory;
      image.history.push(newHistory);
    });
};
