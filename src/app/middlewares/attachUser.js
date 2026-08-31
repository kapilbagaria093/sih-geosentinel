import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export function restrictToAuthenticatedUsers(req, res, next) {
    try {
        if (!ACCESS_TOKEN_SECRET) {
            console.error("ACCESS_TOKEN_SECRET is not configured");

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error",
            });
        }

        // -----------------------------------------------
        // Get Authorization header
        // -----------------------------------------------

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // Expected:
        // Authorization: Bearer <access-token>

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization header",
            });
        }

        // -----------------------------------------------
        // Verify JWT
        // -----------------------------------------------

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

        // -----------------------------------------------
        // Attach authenticated user to request
        // -----------------------------------------------

        req.user = {
            id: decoded.userId,
            role: decoded.role,
            phoneVerified: decoded.phoneVerified,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid access token",
            });
        }

        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
}
