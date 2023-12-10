const ApiError = require('../exceptions/apiError');

module.exports = function(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return next(ApiError.unauthorizedError('Access is denied. Administrator rights required.'));
    }
};