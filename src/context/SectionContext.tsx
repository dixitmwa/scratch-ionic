import React, { createContext, useContext, useState } from "react";

// 1. Update type
type SectionContextType = {
  sectionId: string | null;
  setSectionId: (id: string) => void;
  projectId: string | null;
  setProjectId: (id: string) => void;
  selectedAssignmentItem: any;
  setSelectedAssignmentItem: (item: any) => void;
};

// 2. Update context default
const SectionContext = createContext<SectionContextType | undefined>(undefined);

export const SectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedAssignmentItem, setSelectedAssignmentItem] = useState<any>(null);

  return (
    <SectionContext.Provider value={{
      sectionId,
      setSectionId,
      projectId,
      setProjectId,
      selectedAssignmentItem,
      setSelectedAssignmentItem
    }}>
      {children}
    </SectionContext.Provider>
  );
};

export const useSection = () => {
  const context = useContext(SectionContext);
  if (!context) throw new Error("useSection must be used within a SectionProvider");
  return context;
};
