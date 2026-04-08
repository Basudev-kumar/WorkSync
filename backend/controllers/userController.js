const Task = require("../models/Task.js");
const User = require("../models/User.js");


// @desc Get all users (Admin only)
// @route GET /api/users/
// @access Private (Admin)
const getUsers = async (req, res) => {
  try {
    // Fetch all members (excluding password)
    const users = await User.find({ role: "member" }).select("-password").lean();

    if (users.length === 0) {
      return res.json([]);
    }

    // Single aggregation to count tasks per user per status — replaces N+1 queries
    const userIds = users.map((u) => u._id);

    const taskCounts = await Task.aggregate([
      { $match: { assignedTo: { $in: userIds } } },
      { $unwind: "$assignedTo" },
      { $match: { assignedTo: { $in: userIds } } },
      {
        $group: {
          _id: { userId: "$assignedTo", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a lookup map: userId -> { Pending, "In Progress", Completed }
    const countMap = {};
    taskCounts.forEach(({ _id, count }) => {
      const uid = _id.userId.toString();
      if (!countMap[uid]) {
        countMap[uid] = { pendingTasks: 0, inProgressTasks: 0, completedTasks: 0 };
      }
      if (_id.status === "Pending") countMap[uid].pendingTasks = count;
      else if (_id.status === "In Progress") countMap[uid].inProgressTasks = count;
      else if (_id.status === "Completed") countMap[uid].completedTasks = count;
    });

    const usersWithTaskCounts = users.map((user) => {
      const uid = user._id.toString();
      return {
        ...user,
        pendingTasks: countMap[uid]?.pendingTasks || 0,
        inProgressTasks: countMap[uid]?.inProgressTasks || 0,
        completedTasks: countMap[uid]?.completedTasks || 0,
      };
    });

    res.json(usersWithTaskCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc Get user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { getUsers, getUserById };
