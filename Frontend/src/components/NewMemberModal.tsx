import { useState, useEffect, useRef } from "react";

type NewMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
};

export default function NewMemberModal({ isOpen, onClose, onSubmit }: NewMemberModalProps) {
  const [username, setUsername] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = () => {
    if (!username.trim()) return;
    onSubmit(username.trim());
    setUsername("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
        <h2 className="text-xl font-bold mb-4">Invite New Member</h2>

        <input
          ref={inputRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
            Invite
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
