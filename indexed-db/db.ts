import Dexie, { Table } from "dexie";

export interface ImageHistory {
  id?: number;
  original: Blob;
  current: Blob;
  currentThumbnail: Blob;
  history: Blob[];
}

export class ImageHistoryDexie extends Dexie {
  imageHistory!: Table<ImageHistory>;

  constructor() {
    super("imageHistoryDb");
    this.version(1).stores({
      imageHistory: "++id, original, current, history",
    });
  }
}

export const db = new ImageHistoryDexie();
