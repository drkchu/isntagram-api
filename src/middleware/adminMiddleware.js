console.log("ADMIN MIDDLEWARE ISN'T SETUP JUST YET!!");

const adminMiddleware = (req, res, next) => {
    next();
};

module.exports = adminMiddleware;