import Comment from '../models/Comment.js';

export const registerCommentHandlers = (io, socket) => {

    // Add a new comment thread
    socket.on('comment:add', async ({ roomId, lineStart, lineEnd, username, message }) => {
        try {
            const comment = new Comment({
                roomId,
                lineStart,
                lineEnd,
                thread: [{ username, message }]
            });
            await comment.save();

            // Broadcast the new comment to all users in the room
            io.to(roomId).emit('comment:added', comment);
        } catch (err) {
            socket.emit('error', { message: 'Failed to add comment' });
        }
    });

    // Add a reply to an existing comment thread
    socket.on('comment:reply', async ({ roomId, commentId, username, message }) => {
        try {
            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { $push: { thread: { username, message } } },
                { new: true }
            );

            if (comment) {
                io.to(roomId).emit('comment:updated', comment);
            }
        } catch (err) {
            socket.emit('error', { message: 'Failed to reply to comment' });
        }
    });

    // Resolve a comment thread
    socket.on('comment:resolve', async ({ roomId, commentId }) => {
        try {
            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { resolved: true },
                { new: true }
            );

            if (comment) {
                io.to(roomId).emit('comment:resolved', { commentId });
            }
        } catch (err) {
            socket.emit('error', { message: 'Failed to resolve comment' });
        }
    });
};
