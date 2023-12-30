import { db } from "../db";

export const pushNewHistory = async (imageId: any, newHistory: Blob) => {
  const imageInDb = await db.imageHistory
    .where("id")
    .equals(Number(imageId))
    .modify((image) => image.history.push(newHistory));

  console.log(imageInDb);
};
