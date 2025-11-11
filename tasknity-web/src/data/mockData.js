import { v4 as uuidv4 } from 'uuid';

export const initialState = {
  groups: [
    {
      id: uuidv4(),
      name: "Frontend Team",
      members: ["Alice", "Bob"],
      leaderId: "Alice",
      approved: true,
    },
  ],
  tasks: [
    {
      id: uuidv4(),
      title: "Setup React Project",
      groupId: "",
      status: "in-progress",
      deadline: "2025-11-30",
      assignedTo: "Bob",
      description: "Initialize project and push to GitHub",
    },
  ],
};
