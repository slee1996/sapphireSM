export const CommandBar = ({
  zoom,
  setFrame,
  isDrawing,
  setIsDrawing,
}: {
  zoom: (zoomFactor: number) => void;
  setFrame: any;
  isDrawing: boolean;
  setIsDrawing: (value: any) => void;
}) => {
  return (
    <div className='md:absolute md:top-0 md:left-0 p-0 md:p-1 md:m-0 m-2 space-x-1 flex items-center'>
      <div>
        Image size
        <div className='flex flex-row justify-between mx-3'>
          <button
            onClick={() => zoom(0.9)}
            className='p-0 h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xl font-semibold flex items-center justify-center'
          >
            -
          </button>
          <button
            onClick={() => zoom(1.1)}
            className='p-0 h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xl font-semibold flex items-center justify-center'
          >
            +
          </button>
        </div>
      </div>
      <div>
        Frame size
        <div className='flex flex-row justify-between mx-3'>
          <button
            onClick={() =>
              setFrame((currentVal: any) => {
                return {
                  ...currentVal,
                  width:
                    currentVal.width <= 20
                      ? currentVal.width
                      : currentVal.width - 40,
                  height:
                    currentVal.height <= 20
                      ? currentVal.height
                      : currentVal.height - 40,
                };
              })
            }
            className='p-0 h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xl font-semibold flex items-center justify-center'
          >
            -
          </button>
          <button
            onClick={() =>
              setFrame((currentVal: any) => {
                return {
                  ...currentVal,
                  width:
                    currentVal.width >= 600
                      ? currentVal.width
                      : currentVal.width + 40,
                  height:
                    currentVal.height >= 600
                      ? currentVal.height
                      : currentVal.height + 40,
                };
              })
            }
            className='p-0 h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xl font-semibold flex items-center justify-center'
          >
            +
          </button>
        </div>
      </div>
      <div>
        Draw
        <div className='flex items-center space-x-2'>
          <div className='relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in'>
            <input
              type='checkbox'
              name='toggle'
              id='toggle'
              checked={isDrawing}
              onChange={() => {
                setIsDrawing(!isDrawing);
              }}
              className='toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer peer checked:left-4 hover:w-7 hover:h-7 hover:translate-y-[-5%]'
            />
            <label
              htmlFor='toggle'
              className='toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer peer-checked:bg-blue-500'
            ></label>
          </div>
        </div>
      </div>
    </div>
  );
};
