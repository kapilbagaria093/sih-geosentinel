import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this path if your CSV is stored elsewhere
const csvPath = path.resolve(
    __dirname,
    "../../../data/sikkim_landslide_ml_dataset.csv"
);

const loadLandslides = async () => {
    const file = await fs.readFile(csvPath, "utf-8");

    return parse(file, {
        columns: true,
        skip_empty_lines: true,
    });
};

export const fetchLandslides = async () => {
    const landslides = await loadLandslides();

    return landslides;
};

export const fetchLandslideById = async (id) => {
    const landslides = await loadLandslides();

    return landslides.find(
        (landslide) => String(landslide.event_id) === String(id)
    );
};