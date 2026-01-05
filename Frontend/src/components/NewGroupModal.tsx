import { useState } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupName: string) => void;
};

export default function NewGroupModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [groupName, setGroupName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!groupName.trim()) return;
    onSubmit(groupName.trim());
    setGroupName(""); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
        <h2 className="text-xl font-bold mb-4">Create New Group</h2>

        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
          >
            Create
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
