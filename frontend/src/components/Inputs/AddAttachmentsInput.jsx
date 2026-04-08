// components/Inputs/AddAttachmentsInput

import React, { useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import { LuPaperclip } from "react-icons/lu";

const AddAttachmentsInput = ({ attachments, setAttachments }) => {
  const [option, setOption] = useState("");

  const handleAddOption = () => {
    if (option.trim()) {
      setAttachments([...attachments, option.trim()]);
      setOption("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddOption();
  };

  const handleDeleteOption = (index) => {
    const updatedArr = attachments.filter((_, idx) => idx !== index);
    setAttachments(updatedArr);
  };

  return (
    <div>
      {attachments.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex justify-between bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 px-3 py-2 rounded-md mb-3 mt-2"
        >
          <div className="flex-1 flex items-center gap-3">
            <LuPaperclip className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
            <p className="text-xs text-black dark:text-slate-200 truncate">{item}</p>
          </div>
          <button
            type="button"
            className="cursor-pointer ml-2"
            onClick={() => handleDeleteOption(index)}
          >
            <HiOutlineTrash className="text-lg text-red-500" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-5 mt-4">
        <div className="flex-1 flex items-center gap-3 border border-gray-100 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 transition-colors duration-150">
          <LuPaperclip className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Add File Link"
            value={option}
            onChange={({ target }) => setOption(target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-[13px] text-black dark:text-slate-100 outline-none bg-transparent py-2 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
        <button type="button" className="card-btn text-nowrap" onClick={handleAddOption}>
          <HiMiniPlus className="text-lg" />
          Add
        </button>
      </div>
    </div>
  );
};

export default AddAttachmentsInput;