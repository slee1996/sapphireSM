import mongoose from "mongoose";

export const ImageSchema = new mongoose.Schema({
  b64_json: { type: String, required: true },
  revised_prompt: { type: String, required: true },
});

export const Image =
  mongoose.models.Image || mongoose.model("Image", ImageSchema);
