import { Router } from "express";

import {
    getLayers,
    getLayer,
    getLayerFile,
} from "./controller.js";

const layerRouter = Router();

layerRouter.get("/", getLayers);
layerRouter.get("/:id", getLayer);
layerRouter.get("/:id/file", getLayerFile);

export default layerRouter;