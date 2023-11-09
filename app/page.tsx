import Image from "next/image";
import Chat from "./chat";

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-start p-16 space-y-6'>
      <div className='flex flex-col items-center text-center'>
        <Image
          src='/sapphireSMlogo.png'
          height='180'
          width='180'
          alt=''
          className='m-4 rounded-full'
        />
        <h1 className='text-xl'>SapphireSM</h1>
        <p>Your personal assistant for generating YouTube thumbnails</p>
      </div>
      <Chat />
    </main>
  );
}
