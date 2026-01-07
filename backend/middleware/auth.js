import jwt from "jsonwebtoken";
import User from "../model/User.js";

export const protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({ error: "Not authorized, user not found", success: false , statusCode: 401});
            }
            next();
        } catch (error) {
            return res.status(401).json({ error: "Not authorized, token failed", success: false , statusCode: 401});
        }
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token", success: false , statusCode: 401});
    }
};

