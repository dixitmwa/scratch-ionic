import React, { createContext, useContext, useState } from "react";

type AssignmentContextType = {
  assignmentId: string | null;
  setAssignmentId: (id: string) => void;
};

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const AssignmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  return (
    <AssignmentContext.Provider value={{ assignmentId, setAssignmentId }}>
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) throw new Error("useAssignment must be used within an AssignmentProvider");
  return context;
};
