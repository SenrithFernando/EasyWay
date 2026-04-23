import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "mysecretkey"
    );

    const userId = decoded.id || decoded._id;
    const normalizedId = userId ? String(userId) : undefined;

    req.user = {
      ...decoded,
      _id: normalizedId,
      id: normalizedId,
    };
    
    // Debug logging
    console.log(' Auth Middleware - User authenticated:', {
      email: req.user.email,
      userId: req.user._id,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};