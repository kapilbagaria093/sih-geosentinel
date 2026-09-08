import { Router } from "express";
import {
    getLandslides,
    getLandslideById,
} from "./landslides.controller.js";

const landslideRouter = Router();

landslideRouter.get("/", getLandslides);
landslideRouter.get("/:id", getLandslideById);

export default landslideRouter;