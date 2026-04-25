export const vendorMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "vendor") {
      return res.status(403).json({
        message: "Access denied. Vendor only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Authorization failed",
      error: error.message,
    });
  }
};
