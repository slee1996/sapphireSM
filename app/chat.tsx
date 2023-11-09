"use client";
import { useChat } from "ai/react";
import Image from "next/image";
import { useState } from "react";

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
      <form className='w-full' onSubmit={onFormSubmit}>
        <div>
          <label htmlFor='textOverlayBool'>Add text overlay:</label>
          <input
            placeholder='Text for overlay (leave empty for no overlay)'
            value={state.textToAdd}
            disabled={isLoading}
            onChange={handleTextChange}
            className='border border-gray-300 rounded-lg p-2 my-1 w-full text-black'
          />
          <span className='text-gray-500 italic'>
            Note that this feature is inconsistent, your text may suffer from
            quality issues
          </span>
        </div>
        <div className='flex flex-row w-full space-x-2'>
          <span className='w-full'>
            <label htmlFor='sizeSelect'>Choose a style:</label>
            <select
              id='sizeSelect'
              name='size'
              value={state.style}
              disabled={isLoading}
              onChange={handleStyleChange}
              className='border border-gray-300 rounded-lg p-2 my-1 w-full text-black capitalize'
            >
              {styleOptions.map((styleOption) => (
                <option
                  key={styleOption}
                  value={styleOption}
                  title='This is a tooltip'
                >
                  {styleOption}
                </option>
              ))}
            </select>
            <span className='text-gray-500 italic'>
              {state.style === "vivid"
                ? " Model will lean towards hyper-real and dramatic images"
                : " Model will lean towards more natural, less hyper-real images"}
            </span>
          </span>
          <span className='w-full'>
            <label htmlFor='style'>Choose a size:</label>
            <select
              id='style'
              name='style'
              value={state.size}
              disabled={isLoading}
              onChange={handleSizeChange}
              className='border border-gray-300 rounded-lg p-2 my-1 w-full text-black'
            >
              {sizeOptions.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </span>
        </div>
        <h1>Image Prompt</h1>
        <div className='relative bg-transparent'>
          <input
            id='input'
            disabled={isLoading}
            className='text-black w-full border border-sky-600 rounded-lg p-2 my-1 focus:outline-none drop-shadow-xl pr-16'
            value={input}
            placeholder="The world's cutest kitten huggin a dog"
            onChange={handleInputChange}
          />
          <button
            disabled={isLoading}
            type='submit'
            className='absolute text-black px-4 hover:text-blue-500 right-2 top-0 bottom-0 my-auto'
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
                </div>
              );
            })
        )}
      </div>
    </>
  );
}
