import { Router } from "express";

import {
  createReportController,
  getReportController,
} from "./reports.controller.js";

import {
  restrictToAuthenticatedUsers,
} from "../middlewares/middlewares.attachUser.js";

import {
  reportUpload,
} from "./upload.js";

const reportRouter = Router();

reportRouter.post(
  "/",
  restrictToAuthenticatedUsers,
  reportUpload.array("media", 10),
  createReportController,
);

reportRouter.get(
  "/:id",
  restrictToAuthenticatedUsers,
  getReportController,
);

export default reportRouter;