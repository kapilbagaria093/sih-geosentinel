import {
    fetchLayers,
    getLayerMetadata,
    getLayerFilePath,
} from "./service.js";

export const getLayers = (req, res) => {
    try {
        const layers = fetchLayers();

        return res.status(200).json({
            success: true,
            count: layers.length,
            data: layers,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch layers",
        });
    }
};

export const getLayer = (req, res) => {
    try {
        const { id } = req.params;

        const layer = getLayerMetadata(id);

        if (!layer) {
            return res.status(404).json({
                success: false,
                message: "Layer not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: layer,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch layer",
        });
    }
};

export const getLayerFile = (req, res) => {
    try {
        const { id } = req.params;

        const filePath = getLayerFilePath(id);

        if (!filePath) {
            return res.status(404).json({
                success: false,
                message: "Layer file not found",
            });
        }

        return res.sendFile(filePath);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch layer file",
        });
    }
};