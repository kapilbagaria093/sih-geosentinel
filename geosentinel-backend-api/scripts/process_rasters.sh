#!/bin/bash

set -e

echo "======================================"
echo " GeoSentinel Raster Processing"
echo "======================================"

# -----------------------------
# Paths
# -----------------------------

BOUNDARY="sikkim/sikkim.geojson"

RAW_DIR="data"
OUTPUT_DIR="data/clipped"
TILES_DIR="tiles"

mkdir -p "$OUTPUT_DIR"
mkdir -p "$TILES_DIR"

# -----------------------------
# Reference grid
# -----------------------------
# DEM is our reference raster.
#
# All other rasters will be
# clipped/aligned to this grid.
# -----------------------------

echo ""
echo "Using DEM as reference grid..."

DEM="$RAW_DIR/01_DEM_30m.tif"

# Get DEM bounds
XMIN=$(gdalinfo "$DEM" | awk '/Lower Left/ {print $4}' | tr -d '(),')
YMIN=$(gdalinfo "$DEM" | awk '/Lower Left/ {print $5}' | tr -d '(),')
XMAX=$(gdalinfo "$DEM" | awk '/Upper Right/ {print $4}' | tr -d '(),')
YMAX=$(gdalinfo "$DEM" | awk '/Upper Right/ {print $5}' | tr -d '(),')

echo "DEM bounds:"
echo "  xmin = $XMIN"
echo "  ymin = $YMIN"
echo "  xmax = $XMAX"
echo "  ymax = $YMAX"

# -----------------------------
# DEM
# -----------------------------

echo ""
echo "Processing DEM..."

gdalwarp \
    -cutline "$BOUNDARY" \
    -crop_to_cutline \
    -dstnodata -9999 \
    "$DEM" \
    "$OUTPUT_DIR/dem.tif"

# Get the actual Sikkim-clipped DEM bounds
XMIN=$(gdalinfo "$OUTPUT_DIR/dem.tif" | awk '/Lower Left/ {print $4}' | tr -d '(),')
YMIN=$(gdalinfo "$OUTPUT_DIR/dem.tif" | awk '/Lower Left/ {print $5}' | tr -d '(),')
XMAX=$(gdalinfo "$OUTPUT_DIR/dem.tif" | awk '/Upper Right/ {print $4}' | tr -d '(),')
YMAX=$(gdalinfo "$OUTPUT_DIR/dem.tif" | awk '/Upper Right/ {print $5}' | tr -d '(),')

WIDTH=$(gdalinfo "$OUTPUT_DIR/dem.tif" | awk '/Size is/ {print $3}' | tr -d ',')
HEIGHT=$(gdalinfo "$OUTPUT_DIR/dem.tif" | awk '/Size is/ {print $4}')

echo ""
echo "Reference grid:"
echo "  Size   = ${WIDTH} x ${HEIGHT}"
echo "  Bounds = $XMIN $YMIN $XMAX $YMAX"

# -----------------------------
# Slope
# -----------------------------

echo ""
echo "Processing Slope..."

gdalwarp \
    -cutline "$BOUNDARY" \
    -te "$XMIN" "$YMIN" "$XMAX" "$YMAX" \
    -ts "$WIDTH" "$HEIGHT" \
    -dstnodata -9999 \
    -r bilinear \
    "$RAW_DIR/02_Slope_30m.tif" \
    "$OUTPUT_DIR/slope.tif"

# -----------------------------
# Aspect
# -----------------------------

echo ""
echo "Processing Aspect..."

gdalwarp \
    -cutline "$BOUNDARY" \
    -te "$XMIN" "$YMIN" "$XMAX" "$YMAX" \
    -ts "$WIDTH" "$HEIGHT" \
    -dstnodata -9999 \
    -r near \
    "$RAW_DIR/03_Aspect_30m.tif" \
    "$OUTPUT_DIR/aspect.tif"

# -----------------------------
# NDVI
# -----------------------------

echo ""
echo "Processing NDVI..."

gdalwarp \
    -cutline "$BOUNDARY" \
    -te "$XMIN" "$YMIN" "$XMAX" "$YMAX" \
    -ts "$WIDTH" "$HEIGHT" \
    -dstnodata -9999 \
    -r bilinear \
    "$RAW_DIR/04_NDVI_30m.tif" \
    "$OUTPUT_DIR/ndvi.tif"

# -----------------------------
# Soil Moisture
# -----------------------------

echo ""
echo "Processing Soil Moisture..."

gdalwarp \
    -cutline "$BOUNDARY" \
    -te "$XMIN" "$YMIN" "$XMAX" "$YMAX" \
    -ts "$WIDTH" "$HEIGHT" \
    -dstnodata -9999 \
    -r bilinear \
    "$RAW_DIR/06_Soil_Moisture_30m.tif" \
    "$OUTPUT_DIR/soil_moisture.tif"

# -----------------------------
# Done
# -----------------------------

echo ""
echo "======================================"
echo " Raster processing complete!"
echo "======================================"

echo ""
echo "Processed files:"
ls -lh "$OUTPUT_DIR"