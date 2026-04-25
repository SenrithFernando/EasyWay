export const vendorMiddleware = (req, res, next) => {
  try {
    console.log("🟠 Vendor Middleware Check:");
    console.log("  - User:", req.user);
    console.log("  - User role:", req.user?.role);

    if (!req.user || req.user.role !== "vendor") {
      console.log("❌ Access denied - user role is not 'vendor'");
      return res.status(403).json({
        message: "Access denied. Vendor only.",
        userRole: req.user?.role || "none",
      });
    }

    console.log("✅ Vendor access granted");
    next();
  } catch (error) {
    console.error("❌ Middleware error:", error.message);
    return res.status(500).json({
      message: "Authorization failed",
      error: error.message,
    });
  }
};
