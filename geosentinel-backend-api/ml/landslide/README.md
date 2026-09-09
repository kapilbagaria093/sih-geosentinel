# Sikkim Landslide ML Pipeline

## What was created

- Original dataset: 51 historical positive samples.
- Augmented dataset: 20,000 rows.
- Model: Random Forest classifier.
- Target: `landslide` (0/1).
- GeoTIFF output:
  - `landslide_risk_probability.tif` = continuous probability from 0 to 1.
  - `landslide_risk_level.tif` = categorical risk:
    - 1 = Low
    - 2 = Moderate
    - 3 = High
    - 0 = NoData

## Important limitation

The supplied dataset contains only positive landslide examples. Therefore, the additional
negative examples and additional positive examples are SYNTHETIC. This is useful for
building/testing the end-to-end ML + GeoTIFF pipeline, but the resulting model should
NOT be treated as a scientifically validated landslide susceptibility model.

For a real model, replace/augment the synthetic data with:
1. historical landslide inventory points/polygons (positive samples), and
2. carefully selected non-landslide/background samples (negative samples),
matched to the same raster-derived features.

## Features used by the model

- elevation_m
- slope_deg
- aspect_sin
- aspect_cos
- ndvi
- soil_moisture

Latitude/longitude and event metadata are retained in the dataset but are not direct model
features, because using raw coordinates can make a model memorize geography rather than
learn terrain relationships.

## Train from scratch

```bash
pip install -r requirements.txt

python train_landslide_model.py \
  --csv sikkim_landslide_ml_dataset_augmented.csv \
  --out landslide_risk_model.joblib
```

## Predict from GeoTIFFs

Your five input rasters must be aligned to the exact same grid, CRS, transform, width and height:

```bash
python predict_landslide_geotiff.py \
  --model landslide_risk_model.joblib \
  --elevation elevation.tif \
  --slope slope.tif \
  --aspect aspect.tif \
  --ndvi ndvi.tif \
  --soil-moisture soil_moisture.tif \
  --out-dir predictions
```

The result is two GeoTIFFs. They inherit the reference raster's CRS, transform, dimensions,
and spatial extent, so they can be loaded directly into QGIS/ArcGIS or served by a raster API.

## Example architecture

Raster layers
    ↓
alignment / reprojection / nodata handling
    ↓
feature stack
    ↓
Random Forest
    ↓
probability per pixel
    ↓
risk thresholds
    ↓
GeoTIFF
    ↓
backend / map frontend

## Current training metrics on the synthetic test split

ROC-AUC: 0.9751

Accuracy: 0.9113
