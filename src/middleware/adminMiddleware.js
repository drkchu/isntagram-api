const adminMiddleware = (req, res, next) => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
  };
  
  module.exports = adminMiddleware;
  