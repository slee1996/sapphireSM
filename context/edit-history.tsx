"use client";
import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";

interface EditHistoryContextProps {
  history: any[]; // TODO: Replace 'any' with a more specific type
  updateHistory: Dispatch<SetStateAction<any[]>>;
}

const EditHistoryContext = createContext<EditHistoryContextProps>({
  history: [],
  updateHistory: () => {},
});

export const EditHistoryProvider = ({ children }: { children: any }) => {
  const [history, setHistory] = useState<any[]>([]); // TODO: Replace 'any' with a more specific type

  return (
    <EditHistoryContext.Provider value={{ history, updateHistory: setHistory }}>
      {children}
    </EditHistoryContext.Provider>
  );
};

export const useEditHistoryContext = () => {
  return useContext(EditHistoryContext);
};
