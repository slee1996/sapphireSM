import Image from "next/image";
import Chat from "./chat";

export default function Home() {
  return (
    <>
      <div className='sticky top-0 z-50 flex justify-between items-center w-full px-4 py-2 bg-black border-b-4 border-blue-600'>
        <span className='flex items-center space-x-2'>
          <Image
            src='/sapphireSMlogo.png'
            height='80'
            width='80'
            alt='thumbnailr logo'
            className='rounded-full'
          />
          <h1 className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-600'>
            Thumbnailr
          </h1>
        </span>
        <p className='font-semibold text-gray-300 mr-10 invisible md:visible'>
          Crafting the future of YouTube thumbnails
        </p>
      </div>
      <main className='flex flex-col items-center justify-start px-16 py-4 space-y-6 bg-gray-900 text-gray-300'>
        <Chat />
      </main>
    </>
  );
}
