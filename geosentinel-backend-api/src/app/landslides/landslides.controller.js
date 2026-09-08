import {
    fetchLandslides,
    fetchLandslideById,
} from "./landslides.service.js";

export const getLandslides = async (req, res) => {
    try {
        const landslides = await fetchLandslides();

        return res.status(200).json({
            success: true,
            count: landslides.length,
            data: landslides,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch landslides",
        });
    }
};


export const getLandslideById = async (req, res) => {
    try {
        const { id } = req.params;

        const landslide = await fetchLandslideById(id);

        if (!landslide) {
            return res.status(404).json({
                success: false,
                message: "Landslide not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: landslide,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch landslide",
        });
    }
};