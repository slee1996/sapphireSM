"use client";
import { useChat } from "ai/react";
import Image from "next/image";

export default function Chat() {
  const { input, handleInputChange, handleSubmit, isLoading, messages } =
    useChat();

  return (
    <>
      <form
        className='w-full'
        onSubmit={(e) => {
          handleSubmit(e);
        }}
      >
        <div className='relative bg-transparent'>
          <input
            disabled={isLoading}
            className='text-black w-full border border-sky-600 rounded-lg p-2 my-1 focus:outline-none drop-shadow-2xl pr-12'
            value={input}
            placeholder='Start here'
            onChange={handleInputChange}
          />
          <button
            disabled={isLoading}
            type='submit'
            className='absolute text-black px-4 hover:text-blue-500 right-0 top-0 bottom-0 my-auto'
          >
            Send
          </button>
        </div>
      </form>
      {messages.length > 0
        ? messages
            .filter((msg) => msg.role === "assistant")
            .map((msg) => {
              console.log(JSON.parse(msg.content));
              return (
                <div key={msg.content}>
                  <Image
                    src={JSON.parse(msg.content).data[0].url}
                    alt=''
                    width={400}
                    height={400}
                  />
                </div>
              );
            })
        : null}
    </>
  );
}
