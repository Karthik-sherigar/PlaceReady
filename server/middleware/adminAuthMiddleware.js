const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.ADMIN_JWT_SECRET || (process.env.JWT_SECRET + "_admin");
      const decoded = jwt.verify(token, secret);
      
      if (decoded.role && decoded.role !== "admin") {
         return res.status(401).json({ message: "Not authorized, invalid token role" });
      }

      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
         return res.status(401).json({ message: "Not authorized, admin not found" });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { adminProtect };
