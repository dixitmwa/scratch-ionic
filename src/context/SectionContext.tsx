import React, { createContext, useContext, useState } from "react";

type SectionContextType = {
  sectionId: string | null;
  setSectionId: (id: string) => void;
  projectId: string | null;
  setProjectId: (id: string) => void;
};

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export const SectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  return (
    <SectionContext.Provider value={{ sectionId, setSectionId, projectId, setProjectId }}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSection = () => {
  const context = useContext(SectionContext);
  if (!context) throw new Error("useSection must be used within a SectionProvider");
  return context;
};
