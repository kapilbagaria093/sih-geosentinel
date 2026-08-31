import crypto from "crypto";
import jwt from "jsonwebtoken";
import { eq, and, gt } from "drizzle-orm";

import { db } from "../db/index.js";
import { user, session } from "../db/schema.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

function generateId() {
    return crypto.randomUUID();
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

function createAccessToken(user) {
    if (!ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not configured");
    }

    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
            phoneVerified: user.phoneVerified,
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        },
    );
}

function getRefreshExpiryDate() {
    const date = new Date();

    date.setDate(date.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

    return date;
}

function sanitizeUser(user) {
    return {
        id: user.id,
        role: user.role,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        latitude: user.latitude,
        longitude: user.longitude,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

// ---------------------------------------------------------
// Controller
// ---------------------------------------------------------

export class AuthenticationController {
    // =======================================================
    // SIGN UP
    // =======================================================

    async handleSignup(req, res) {
        try {
            const { phoneNumber, latitude, longitude } = req.body;

            // -----------------------------------------------
            // Validation
            // -----------------------------------------------

            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number is required",
                });
            }

            // Basic phone validation.
            // Ideally normalize to E.164 format before storing.
            const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");

            if (!/^\+?[1-9]\d{9,14}$/.test(normalizedPhone)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number",
                });
            }

            // -----------------------------------------------
            // Check existing user
            // -----------------------------------------------

            const existingUser = await db
                .select()
                .from(user)
                .where(eq(user.phoneNumber, normalizedPhone))
                .limit(1);

            if (existingUser.length > 0) {
                const existing = existingUser[0];

                // If user exists but isn't verified,
                // resend OTP instead of creating another account.
                if (!existing.phoneVerified) {
                    const otp = generateOTP();

                    await db
                        .update(user)
                        .set({
                            phoneVerificationCode: otp,
                            latitude:
                                latitude !== undefined
                                    ? latitude
                                    : existing.latitude,
                            longitude:
                                longitude !== undefined
                                    ? longitude
                                    : existing.longitude,
                            updatedAt: new Date(),
                        })
                        .where(eq(user.id, existing.id));

                    // TODO:
                    // Send OTP through SMS provider here.
                    console.log(`OTP for ${normalizedPhone}: ${otp}`);

                    return res.status(200).json({
                        success: true,
                        message: "Verification code sent",
                        userId: existing.id,

                        // REMOVE THIS IN PRODUCTION
                        otp,
                    });
                }

                return res.status(409).json({
                    success: false,
                    message: "User already exists. Please sign in.",
                });
            }

            // -----------------------------------------------
            // Create user
            // -----------------------------------------------

            const otp = generateOTP();

            const userId = generateId();

            const newUser = await db
                .insert(user)
                .values({
                    id: userId,
                    role: "user",

                    phoneNumber: normalizedPhone,

                    phoneVerified: false,

                    phoneVerificationCode: otp,

                    latitude: latitude !== undefined ? latitude : null,

                    longitude: longitude !== undefined ? longitude : null,
                })
                .returning();

            // TODO:
            // Send OTP using Twilio / MSG91 / AWS SNS /
            // whatever SMS provider you choose.

            console.log(`OTP for ${normalizedPhone}: ${otp}`);

            return res.status(201).json({
                success: true,
                message: "Account created. Verification code sent.",
                userId: newUser[0].id,

                // REMOVE THIS IN PRODUCTION
                otp,
            });
        } catch (error) {
            console.error("Signup error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create account",
            });
        }
    }

    // =======================================================
    // SIGN IN
    // =======================================================
    async handleSigninRequestOTP(req, res) {
        try {
            const { phoneNumber } = req.body;

            if (!phoneNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number is required",
                });
            }

            const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");

            const users = await db
                .select()
                .from(user)
                .where(eq(user.phoneNumber, normalizedPhone))
                .limit(1);

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No account found with this phone number",
                });
            }

            const existingUser = users[0];

            const otp = generateOTP();

            await db
                .update(user)
                .set({
                    phoneVerificationCode: otp,
                    updatedAt: new Date(),
                })
                .where(eq(user.id, existingUser.id));

            // TODO: Send OTP through your SMS provider
            console.log(`OTP for ${normalizedPhone}: ${otp}`);

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
            });
        } catch (error) {
            console.error("Request OTP error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to send OTP",
            });
        }
    }

    async handleSigninVerifyOTP(req, res) {
        try {
            const { phoneNumber, otp, latitude, longitude } = req.body;

            if (!phoneNumber || !otp) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number and OTP are required",
                });
            }

            const normalizedPhone = phoneNumber.trim().replace(/\s+/g, "");

            const users = await db
                .select()
                .from(user)
                .where(eq(user.phoneNumber, normalizedPhone))
                .limit(1);

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const existingUser = users[0];

            if (
                !existingUser.phoneVerificationCode ||
                existingUser.phoneVerificationCode !== otp
            ) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid OTP",
                });
            }

            const updatedUsers = await db
                .update(user)
                .set({
                    phoneVerified: true,
                    phoneVerificationCode: null,

                    latitude:
                        latitude !== undefined
                            ? latitude
                            : existingUser.latitude,

                    longitude:
                        longitude !== undefined
                            ? longitude
                            : existingUser.longitude,

                    updatedAt: new Date(),
                })
                .where(eq(user.id, existingUser.id))
                .returning();

            const authenticatedUser = updatedUsers[0];

            const accessToken = createAccessToken(authenticatedUser);

            const refreshToken = generateRefreshToken();

            await db.insert(session).values({
                id: generateId(),
                userId: authenticatedUser.id,
                refreshToken,
                expiresAt: getRefreshExpiryDate(),
            });

            return res.status(200).json({
                success: true,
                message: "Signed in successfully",

                user: sanitizeUser(authenticatedUser),

                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error("Verify OTP error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to verify OTP",
            });
        }
    }

    
    // =======================================================
    // GET CURRENT USER
    // =======================================================

    async handleMe(req, res) {
        try {
            // attachUser middleware should populate req.user

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authenticated",
                });
            }

            const users = await db
                .select()
                .from(user)
                .where(eq(user.id, req.user.id))
                .limit(1);

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            return res.status(200).json({
                success: true,
                user: sanitizeUser(users[0]),
            });
        } catch (error) {
            console.error("Get me error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to get user",
            });
        }
    }

    // =======================================================
    // LOGOUT
    // =======================================================

    async handleLogout(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: "Refresh token is required",
                });
            }

            await db
                .delete(session)
                .where(eq(session.refreshToken, refreshToken));

            return res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to logout",
            });
        }
    }

    // =======================================================
    // REFRESH SESSION
    // =======================================================

    async getNewRefreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token is required",
                });
            }

            // ---------------------------------------------------
            // Find valid session
            // ---------------------------------------------------

            const sessions = await db
                .select()
                .from(session)
                .where(
                    and(
                        eq(session.refreshToken, refreshToken),
                        gt(session.expiresAt, new Date()),
                    ),
                )
                .limit(1);

            if (sessions.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired refresh token",
                });
            }

            const currentSession = sessions[0];

            // ---------------------------------------------------
            // Get user
            // ---------------------------------------------------

            const users = await db
                .select()
                .from(user)
                .where(eq(user.id, currentSession.userId))
                .limit(1);

            if (users.length === 0) {
                // Remove orphaned session
                await db
                    .delete(session)
                    .where(eq(session.id, currentSession.id));

                return res.status(401).json({
                    success: false,
                    message: "User no longer exists",
                });
            }

            const authenticatedUser = users[0];

            // ---------------------------------------------------
            // Rotate refresh token
            // ---------------------------------------------------

            const newRefreshToken = generateRefreshToken();

            await db
                .update(session)
                .set({
                    refreshToken: newRefreshToken,
                    expiresAt: getRefreshExpiryDate(),
                })
                .where(eq(session.id, currentSession.id));

            // ---------------------------------------------------
            // New access token
            // ---------------------------------------------------

            const accessToken = createAccessToken(authenticatedUser);

            return res.status(200).json({
                success: true,

                accessToken,

                refreshToken: newRefreshToken,
            });
        } catch (error) {
            console.error("Refresh session error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to refresh session",
            });
        }
    }
}
