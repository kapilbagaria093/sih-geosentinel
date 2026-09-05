import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rasterDirectory = path.resolve(
    __dirname,
    "../../../data/clipped"
);

const layers = {
    dem: {
        id: "dem",
        name: "Elevation",
        type: "raster",
        format: "geotiff",
        unit: "meters",
        resolution: "30m",
        filename: "dem.tif",
    },

    slope: {
        id: "slope",
        name: "Slope",
        type: "raster",
        format: "geotiff",
        unit: "degrees",
        resolution: "30m",
        filename: "slope.tif",
    },

    aspect: {
        id: "aspect",
        name: "Aspect",
        type: "raster",
        format: "geotiff",
        unit: "degrees",
        resolution: "30m",
        filename: "aspect.tif",
    },

    ndvi: {
        id: "ndvi",
        name: "NDVI",
        type: "raster",
        format: "geotiff",
        unit: "index",
        resolution: "30m",
        filename: "ndvi.tif",
    },

    "soil-moisture": {
        id: "soil-moisture",
        name: "Soil Moisture",
        type: "raster",
        format: "geotiff",
        unit: "index",
        resolution: "30m",
        filename: "soil_moisture.tif",
    },
};

const getRasterBounds = (filePath) => {
    const output = execFileSync(
        "gdalinfo",
        ["-json", filePath],
        { encoding: "utf-8" }
    );

    const info = JSON.parse(output);

    const corners = info.cornerCoordinates;

    return {
        west: corners.lowerLeft[0],
        south: corners.lowerLeft[1],
        east: corners.upperRight[0],
        north: corners.upperRight[1],
    };
};

export const fetchLayers = () => {
    return Object.values(layers).map(({ filename, ...layer }) => {
        const filePath = path.join(rasterDirectory, filename);

        return {
            ...layer,
            url: `/api/v1/layers/${layer.id}/file`,
            bounds: getRasterBounds(filePath),
        };
    });
};

export const fetchLayerById = (id) => {
    return layers[id] || null;
};

export const getLayerFilePath = (id) => {
    const layer = layers[id];

    if (!layer) {
        return null;
    }

    const filePath = path.join(rasterDirectory, layer.filename);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    return filePath;
};

export const getLayerMetadata = (id) => {
    const layer = layers[id];

    if (!layer) {
        return null;
    }

    const filePath = path.join(rasterDirectory, layer.filename);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    return {
        id: layer.id,
        name: layer.name,
        type: layer.type,
        format: layer.format,
        unit: layer.unit,
        resolution: layer.resolution,
        url: `/api/v1/layers/${layer.id}/file`,
        bounds: getRasterBounds(filePath),
    };
};