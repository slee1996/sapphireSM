"use client";
import { useChat } from "ai/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NewCanvas } from "./components/NewCanvas";
import { ScrollArea } from "@/components/ui/scroll-area";
import EditHistory from "./components/EditHistory";
import { db } from "@/indexed-db/db";
import { base64ToBlob } from "@/utils/base64-to-blob";
import { createThumbnailBlob } from "@/utils/base64-to-compressed-blob";
import { useRouter } from "next/navigation";

const sizeOptions = ["1024x1024", "1792x1024", "1024x1792"];
const styleOptions = ["vivid", "natural"];

const defaultState = {
  textToAdd: "",
  size: sizeOptions[1],
  style: styleOptions[0],
};

export default function Chat() {
  const [state, setState] = useState(defaultState);
  const [imageToEdit, setImageToEdit] = useState({
    url: "",
    prompt: "",
  });
  const router = useRouter();
  const { input, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({
      body: state,
      onFinish: async (message) => {
        let newKey;
        const content = JSON.parse(message.content);
        const { b64_json } = content.data[0];
        const blobbifiedImage = base64ToBlob(b64_json, "image/png");
        const thumbnailBlob = await createThumbnailBlob({
          base64Data: b64_json,
          thumbnailWidth: 200,
          thumbnailHeight: 100,
        });

        db.imageHistory
          .add({
            id: message.id,
            original: blobbifiedImage,
            current: blobbifiedImage,
            currentThumbnail: thumbnailBlob as Blob,
            history: [],
          })
          .then((primaryKey: any) => {
            newKey = primaryKey;
          });
      },
    });

  const onFormSubmit = (e: any) => {
    e.preventDefault();
    handleSubmit(e);
    setState({ ...defaultState });
  };

  const handleTextChange = (e: any) => {
    setState({ ...state, textToAdd: e.target.value });
  };

  const handleSizeChange = (e: any) => {
    setState({ ...state, size: e.target.value });
  };

  const handleStyleChange = (e: any) => {
    setState({ ...state, style: e.target.value });
  };

  useEffect(() => {
    db.imageHistory.clear();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row space-x-2 h-1/2">
        <form
          className="w-full bg-black text-white rounded-lg shadow-xl  flex flex-col space-y-2"
          onSubmit={onFormSubmit}
        >
          <ScrollArea className="h-[26rem] p-4">
            <div className="">
              <label
                htmlFor="textOverlayBool"
                className="block mb-2 text-sm font-bold"
              >
                Add text overlay:
              </label>
              <input
                type="text"
                placeholder="Viral Video :O"
                value={state.textToAdd}
                disabled={isLoading}
                onChange={handleTextChange}
                className="w-full bg-gray-800 text-white border-none rounded-full p-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="block mt-1 text-xs text-gray-400 italic">
                Leave empty for no overlay. Note that this feature is
                inconsistent, your text may suffer from quality issues.
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="w-full">
                <label
                  htmlFor="sizeSelect"
                  className="block mb-2 text-sm font-bold"
                >
                  Choose a style:
                </label>
                <select
                  id="sizeSelect"
                  name="size"
                  value={state.style}
                  disabled={isLoading}
                  onChange={handleStyleChange}
                  className="w-full bg-gray-800 text-white border-none rounded-full p-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
                >
                  {styleOptions.map((styleOption) => (
                    <option
                      key={styleOption}
                      value={styleOption}
                      className="bg-gray-700"
                    >
                      {styleOption}
                    </option>
                  ))}
                </select>
                <span className="block mt-1 text-xs text-gray-400 italic">
                  {state.style === "vivid"
                    ? "Model will lean towards hyper-real and dramatic images"
                    : "Model will lean towards more natural, less hyper-real images"}
                </span>
              </div>
              {/* <div className='w-full'>
              <label htmlFor='style' className='block mb-2 text-sm font-bold'>
                Choose a size:
              </label>
              <select
                id='style'
                name='style'
                value={state.size}
                disabled={isLoading}
                onChange={handleSizeChange}
                className='w-full bg-gray-800 text-white border-none rounded-full p-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                {sizeOptions.map((sizeOption) => (
                  <option
                    key={sizeOption}
                    value={sizeOption}
                    className='bg-gray-700'
                  >
                    {sizeOption}
                  </option>
                ))}
              </select>
            </div> */}
            </div>
            <label
              htmlFor="imagePrompt"
              className="block mb-2 text-sm font-bold"
            >
              Image Prompt:
            </label>
            <textarea
              id="imagePrompt"
              disabled={isLoading}
              value={input}
              onChange={handleInputChange}
              placeholder="The world's cutest kitten huggin a dog"
              className="h-28 w-full bg-gray-800 text-white border border-sky-600 rounded-lg p-3 shadow-md focus:outline-none"
            />
            <button
              disabled={isLoading}
              type="submit"
              className="rounded-full bg-blue-500 text-white px-3 py-1 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </ScrollArea>
        </form>

        <div className="w-full bg-black text-white rounded-lg shadow-xl">
          <ScrollArea className="h-[26rem] p-4">
            <h1>Generated Images</h1>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              messages
                .filter((msg) => msg.role === "assistant")
                .map((msg, index) => {
                  const content = JSON.parse(msg.content);
                  const { url } = content.data[0];
                  const filename = `generatedImage-${index}.jpg`;

                  return (
                    <div key={`${url ?? content.data[0].b64_json}-${index}`}>
                      <a
                        href={
                          url ??
                          `data:image/jpeg;base64,${content.data[0].b64_json}`
                        }
                        type="button"
                        title="Download Image"
                        download={filename}
                        className="rounded-full bg-white m-1 text-black hover:bg-black hover:text-white px-2"
                      >
                        Download Image
                      </a>
                      <button
                        onClick={() => {
                          setImageToEdit({
                            url: `data:image/jpeg;base64,${content.data[0].b64_json}`,
                            prompt: content.data[0].revised_prompt,
                          });
                          router.replace("?imageKey=" + msg.id, {
                            scroll: false,
                          });
                        }}
                        className="rounded-full bg-white m-1 text-black hover:bg-black hover:text-white px-2"
                      >
                        Edit Image
                      </button>
                      <Image
                        src={
                          url ??
                          `data:image/jpeg;base64,${content.data[0].b64_json}`
                        }
                        alt=""
                        width={Number(state.size.split("x")[0])}
                        height={Number(state.size.split("x")[1])}
                      />

                      <hr className="my-1" />
                    </div>
                  );
                })
            )}
          </ScrollArea>
        </div>
      </div>
      <div>
        <NewCanvas testImg={imageToEdit.url} setTestImg={setImageToEdit} />
      </div>
      <EditHistory />
    </div>
  );
}
