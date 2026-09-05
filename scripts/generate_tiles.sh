#!/bin/bash

set -e

echo "======================================"
echo " GeoSentinel Tile Generation"
echo "======================================"

INPUT_DIR="data/clipped"
OUTPUT_DIR="tiles"

MIN_ZOOM=8
MAX_ZOOM=14

mkdir -p "$OUTPUT_DIR"

generate_tiles() {
    INPUT_FILE="$1"
    OUTPUT_NAME="$2"

    echo ""
    echo "Generating tiles for: $OUTPUT_NAME"
    echo "Input: $INPUT_FILE"
    echo "Output: $OUTPUT_DIR/$OUTPUT_NAME"

    rm -rf "$OUTPUT_DIR/$OUTPUT_NAME"
    mkdir -p "$OUTPUT_DIR/$OUTPUT_NAME"

    gdal2tiles.py \
        --xyz \
        -z "$MIN_ZOOM-$MAX_ZOOM" \
        "$INPUT_FILE" \
        "$OUTPUT_DIR/$OUTPUT_NAME"

    echo "Finished: $OUTPUT_NAME"
}

# DEM
generate_tiles \
    "$INPUT_DIR/dem.tif" \
    "dem"

# Slope
generate_tiles \
    "$INPUT_DIR/slope.tif" \
    "slope"

# Aspect
generate_tiles \
    "$INPUT_DIR/aspect.tif" \
    "aspect"

# NDVI
generate_tiles \
    "$INPUT_DIR/ndvi.tif" \
    "ndvi"

# Soil Moisture
generate_tiles \
    "$INPUT_DIR/soil_moisture.tif" \
    "soil-moisture"

echo ""
echo "======================================"
echo " Tile generation complete!"
echo "======================================"

echo ""
echo "Generated tile directories:"
find "$OUTPUT_DIR" -maxdepth 1 -type d