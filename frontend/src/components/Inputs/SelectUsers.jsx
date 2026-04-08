// components/Inputs/SelectUsers.jsx

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuUsers } from 'react-icons/lu';
import Modal from '../Modal';
import AvatarGroup from '../AvatarGroup';

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {

    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const toggleUserSelection = (userId) => {
        setTempSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleAssign = () => {
        setSelectedUsers(tempSelectedUsers);
        setIsModalOpen(false);
    };

    // Pre-populate temp selection with already-selected users each time the modal opens
    const handleOpenModal = () => {
        setTempSelectedUsers([...selectedUsers]);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        // Discard unsaved changes — restore the last confirmed selection
        setTempSelectedUsers([...selectedUsers]);
        setIsModalOpen(false);
    };

    const selectedUserAvatars = allUsers
        .filter((user) => selectedUsers.includes(user._id))
        .map((user) => user.profileImageUrl);

    useEffect(() => {
        getAllUsers();
    }, []);

    // Keep tempSelectedUsers in sync when selectedUsers is cleared externally
    useEffect(() => {
        if (selectedUsers.length === 0) {
            setTempSelectedUsers([]);
        }
    }, [selectedUsers]);


    return (
        <div className="space-y-4 mt-2">
            {selectedUserAvatars.length === 0 && (
                <button className="card-btn" onClick={handleOpenModal}>
                    <LuUsers className="text-sm" />
                    Add Members
                </button>
            )}

            {selectedUserAvatars.length > 0 && (
                <div className="cursor-pointer" onClick={handleOpenModal}>
                    <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Select Users"
            >
                <div className="space-y-2 h-[60vh] overflow-y-auto pr-1">
                    {allUsers.map((user) => {
                        const isSelected = tempSelectedUsers.includes(user._id);
                        return (
                            <div
                                key={user._id}
                                onClick={() => toggleUserSelection(user._id)}
                                className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors duration-150 ${
                                    isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                        : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <img
                                    src={user.profileImageUrl}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 dark:text-slate-100 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-[13px] text-gray-500 dark:text-slate-400 truncate">
                                        {user.email}
                                    </p>
                                </div>

                                {/* Custom circular toggle indicator */}
                                <span
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                                        isSelected
                                            ? 'bg-primary border-primary'
                                            : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500'
                                    }`}
                                >
                                    {isSelected && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-slate-700 mt-2">
                    <button className="card-btn" onClick={handleCloseModal}>
                        CANCEL
                    </button>
                    <button className="card-btn-fill" onClick={handleAssign}>
                        DONE
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SelectUsers;
