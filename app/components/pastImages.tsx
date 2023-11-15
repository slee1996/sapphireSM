import { sql } from "@vercel/postgres";
import Image from "next/image";
import { CopyButton } from "./copyButton";

function isValidBase64(str: string) {
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return base64Regex.test(str);
}

async function getData() {
  const result = await sql`select * from images`;

  return result.rows;
}

export const PastImages = async () => {
  const images = await getData();

  return (
    <div className='flex flex-col items-center w-full'>
      Check out what other people have done:
      <div className='flex flex-row items-center justify-center space-x-2 overflow-x-scroll w-full'>
        {images
          .filter((image) => isValidBase64(image.b64_json))
          .map((image, i) => (
            <div key={i}>
              <Image
                src={`data:image/jpeg;base64,${image.b64_json}`}
                alt={image.revised_prompt}
                width={400}
                height={200}
              />
              <CopyButton valueToCopy={image.revised_prompt} />
            </div>
          ))}
      </div>
    </div>
  );
};
