import { useState, useEffect, useRef } from "react";

type NewItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemName: string) => void;
};

export default function NewItemModal({ isOpen, onClose, onSubmit }: NewItemModalProps) {
  const [itemName, setItemName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = () => {
    if (!itemName.trim()) return;
    onSubmit(itemName.trim());
    setItemName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 relative">
        <h2 className="text-xl font-bold mb-4">Add New Item</h2>

        <input
          ref={inputRef}
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
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
            Add
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
