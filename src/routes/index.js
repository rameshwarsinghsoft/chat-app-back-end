const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const commonRoutes = require('./common.routes');
const messageRoutes = require('./message.routes');

const apiRouter = (app) => {
    app.use('/api/user', userRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/common', commonRoutes)
    app.use('/api', messageRoutes)
};

module.exports = apiRouter;