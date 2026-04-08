import React from 'react'

const UserCard = ({ userInfo }) => {
    return (
        <div className="user-card p-2">
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-3'>
                    <img
                        src={userInfo?.profileImageUrl || ''}
                        alt={`${userInfo?.name}'s avatar`}
                        className='w-12 h-12 rounded-full border-2 border-white object-cover'
                    />
                    <div>
                        <p className="text-sm font-medium">{userInfo?.name}</p>
                        <p className="text-xs text-gray-500">{userInfo?.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-end gap-3 mt-5">
                <StatCard
                    label="Pending"
                    count={userInfo?.pendingTasks || 0}
                    status="Pending"
                />
                <StatCard
                    label="In Progress"
                    count={userInfo?.inProgressTasks || 0}
                    status="In Progress"
                />
                <StatCard
                    label="Completed"
                    count={userInfo?.completedTasks || 0}
                    status="Completed"
                />
            </div>
        </div>
    );
};

export default UserCard;


const StatCard = ({ label, count, status }) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return "text-cyan-600 bg-cyan-50 border-cyan-100";
            case "Completed":
                return "text-green-600 bg-green-50 border-green-100";
            default:
                return "text-violet-600 bg-violet-50 border-violet-100";
        }
    };

    return (
        <div className={`border rounded-md px-4 py-0.5 text-center ${getStatusTagColor()}`}>
            <p className="text-xs font-medium">{label}</p>
            <p className="text-lg font-semibold mt-1">{count}</p>
        </div>
    );
};