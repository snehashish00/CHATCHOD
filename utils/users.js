const users = [];

// join user to chat.
function userJoin(id, username, room) {
    const user = {id, username, room};

    users.push(user);
    return user;
}

// Get current user (by matching id)
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    // return the use who left.
    if(index !== -1) {
        const leaveUser = users.splice(index, 1);
        return leaveUser[0];
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin, 
    getCurrentUser,
    userLeave,
    getRoomUsers
}