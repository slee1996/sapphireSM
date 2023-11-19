"use client";
import { useChat } from "ai/react";
import Image from "next/image";
import { useState } from "react";
import CanvasEditor from "./components/canvasEditor";

const sizeOptions = ["1024x1024", "1792x1024", "1024x1792"];
const styleOptions = ["vivid", "natural"];

const defaultState = {
  textToAdd: "",
  size: sizeOptions[1],
  style: styleOptions[0],
};

export default function Chat() {
  const [state, setState] = useState(defaultState);

  const { input, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({
      body: state,
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

  return (
    <>
      <form
        className='w-full bg-black text-white p-4 rounded-lg shadow-xl'
        onSubmit={onFormSubmit}
      >
        <div className='mb-6'>
          <label
            htmlFor='textOverlayBool'
            className='block mb-2 text-sm font-bold'
          >
            Add text overlay:
          </label>
          <input
            type='text'
            placeholder='Text for overlay (leave empty for no overlay)'
            value={state.textToAdd}
            disabled={isLoading}
            onChange={handleTextChange}
            className='w-full bg-gray-800 text-white border-none rounded-full p-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none'
          />
          <span className='block mt-1 text-xs text-gray-400 italic'>
            Note that this feature is inconsistent, your text may suffer from
            quality issues
          </span>
        </div>
        <div className='flex flex-col md:flex-row md:space-x-4 mb-6'>
          <div className='w-full mb-6 md:mb-0'>
            <label
              htmlFor='sizeSelect'
              className='block mb-2 text-sm font-bold'
            >
              Choose a style:
            </label>
            <select
              id='sizeSelect'
              name='size'
              value={state.style}
              disabled={isLoading}
              onChange={handleStyleChange}
              className='w-full bg-gray-800 text-white border-none rounded-full p-3 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize'
            >
              {styleOptions.map((styleOption) => (
                <option
                  key={styleOption}
                  value={styleOption}
                  className='bg-gray-700'
                >
                  {styleOption}
                </option>
              ))}
            </select>
            <span className='block mt-1 text-xs text-gray-400 italic'>
              {state.style === "vivid"
                ? "Model will lean towards hyper-real and dramatic images"
                : "Model will lean towards more natural, less hyper-real images"}
            </span>
          </div>
          <div className='w-full'>
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
          </div>
        </div>
        <label htmlFor='imagePrompt' className='block mb-2 text-sm font-bold'>
            Image Prompt:
          </label>
        <div className='relative mb-6'>
          <input
            id='imagePrompt'
            disabled={isLoading}
            value={input}
            onChange={handleInputChange}
            placeholder="The world's cutest kitten huggin a dog"
            className='w-full bg-gray-800 text-white border border-sky-600 rounded-full p-3 shadow-md focus:outline-none'
          />
          <button
            disabled={isLoading}
            type='submit'
            className='absolute right-0 top-1/2 mr-3 transform -translate-y-1/2 rounded-full bg-blue-500 text-white px-3 py-1 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300'
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
      <div className='my-4'>
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
                <div
                  key={`${url ?? content.data[0].b64_json}-${index}`}
                  className='my-2 border border-white'
                >
                  <a
                    href={
                      url ??
                      `data:image/jpeg;base64,${content.data[0].b64_json}`
                    }
                    title='Download Image'
                    download={filename}
                  >
                    Download Image
                  </a>
                  <Image
                    src={
                      url ??
                      `data:image/jpeg;base64,${content.data[0].b64_json}`
                    }
                    alt=''
                    width={Number(state.size.split("x")[0])}
                    height={Number(state.size.split("x")[1])}
                  />
                  {/* <h1>Edit Image:</h1>
                  <CanvasEditor
                    originalPrompt={content.data[0].revised_prompt}
                    src={`data:image/jpeg;base64,${content.data[0].b64_json}`}
                  /> */}
                </div>
              );
            })
        )}
      </div>
    </>
  );
}
