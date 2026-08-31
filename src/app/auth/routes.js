import { Router } from "express";
import { AuthenticationController } from "./controller.js";
import { restrictToAuthenticatedUsers } from "../middlewares/attachUser.js";

export const authRouter = Router();

const authController = new AuthenticationController();

authRouter.post(
  "/sign-up",
  authController.handleSignup.bind(authController)
);

authRouter.post(
  "/sign-in/request-otp",
  authController.handleSigninRequestOTP.bind(authController)
);

authRouter.post(
  "/sign-in/verify-otp",
  authController.handleSigninVerifyOTP.bind(authController)
);

authRouter.get(
  "/me",
  restrictToAuthenticatedUsers,
  authController.handleMe.bind(authController)
);

authRouter.post(
  "/logout",
  restrictToAuthenticatedUsers,
  authController.handleLogout.bind(authController)
);

authRouter.post(
  "/refresh-session",
  authController.getNewRefreshToken.bind(authController)
);