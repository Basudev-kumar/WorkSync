// components/Inputs/TodoListInput

import React, { useState } from "react";
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";


const TodoListInput = ({ todoList, setTodoList }) => {
  const [option, setOption] = useState("");

  const handleAddOption = () => {
    if (option.trim()) {
      setTodoList([...todoList, option.trim()]);
      setOption("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddOption();
  };

  const handleDeleteOption = (index) => {
    const updatedArr = todoList.filter((_, idx) => idx !== index);
    setTodoList(updatedArr);
  };

  return (
    <div>
      {todoList.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex justify-between bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 px-3 py-2 rounded-md mb-3 mt-2"
        >
          <p className="text-xs text-black dark:text-slate-200">
            <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold mr-2">
              {index < 9 ? `0${index + 1}` : index + 1}
            </span>
            {item}
          </p>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => handleDeleteOption(index)}
          >
            <HiOutlineTrash className="text-lg text-red-500" />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-5 mt-4">
        <input
          type="text"
          placeholder="Enter Task"
          value={option}
          onChange={({ target }) => setOption(target.value)}
          onKeyDown={handleKeyDown}
          className="w-full text-[13px] text-black dark:text-slate-100 outline-none bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-600 px-3 py-2 rounded-md placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors duration-150"
        />
        <button type="button" className="card-btn text-nowrap" onClick={handleAddOption}>
          <HiMiniPlus className="text-lg" />
          Add
        </button>
      </div>
    </div>
  );
};

export default TodoListInput;