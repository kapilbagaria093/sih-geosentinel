from pathlib import Path

import numpy as np
import pandas as pd
import geopandas as gpd
import rasterio

from rasterio.vrt import WarpedVRT
from rasterio.enums import Resampling
from rasterio.features import geometry_mask

from shapely.ops import unary_union


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_DIR = PROJECT_ROOT / "data"
SIKKIM_BOUNDARY = PROJECT_ROOT / "sikkim" / "sikkim.geojson"

DEM_PATH = DATA_DIR / "01_DEM_30m.tif"
SLOPE_PATH = DATA_DIR / "02_Slope_30m.tif"
ASPECT_PATH = DATA_DIR / "03_Aspect_30m.tif"
NDVI_PATH = DATA_DIR / "04_NDVI_30m.tif"
SOIL_PATH = DATA_DIR / "06_Soil_Moisture_30m.tif"
LANDSLIDE_CSV = DATA_DIR / "Historical_Landslides_CSV.csv"

OUTPUT_PATH = DATA_DIR / "sikkim_landslide_ml_dataset.csv"


# ============================================================
# SETTINGS
# ============================================================

RANDOM_SEED = 42

# Number of negative samples relative to positive samples.
# 1.0 means equal numbers of positive and negative samples.
NEGATIVE_RATIO = 1.0

# Don't select a "non-landslide" point within this distance
# of a known historical landslide.
EXCLUSION_DISTANCE_METERS = 300


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def read_aligned_raster(path, reference, resampling):
    """
    Read a raster and automatically align it to the DEM grid.
    """

    print(f"  Reading: {path.name}")

    with rasterio.open(path) as src:

        with WarpedVRT(
            src,

            crs=reference.crs,

            transform=reference.transform,

            width=reference.width,

            height=reference.height,

            resampling=resampling,

        ) as vrt:

            return vrt.read(1, masked=True)


def extract_values_from_array(
    array,
    xs,
    ys,
    reference
):
    """
    Extract raster values at geographic coordinates.
    """

    inverse_transform = ~reference.transform

    values = []

    for x, y in zip(xs, ys):

        col, row = inverse_transform * (x, y)

        col = int(np.floor(col))
        row = int(np.floor(row))

        if (
            0 <= row < reference.height
            and
            0 <= col < reference.width
        ):

            value = array[row, col]

            if np.ma.is_masked(value):
                values.append(np.nan)

            else:
                values.append(float(value))

        else:

            values.append(np.nan)

    return np.array(values)


# ============================================================
# START
# ============================================================

print()
print("=" * 70)
print(" SIKKIM LANDSLIDE ML DATASET BUILDER")
print("=" * 70)
print()


# ============================================================
# CHECK FILES
# ============================================================

print("Checking files...")

required_files = [
    DEM_PATH,
    SLOPE_PATH,
    ASPECT_PATH,
    NDVI_PATH,
    SOIL_PATH,
    LANDSLIDE_CSV,
    SIKKIM_BOUNDARY,
]

for path in required_files:

    if not path.exists():

        print()
        print(f"ERROR: File not found:")
        print(path)
        print()

        raise SystemExit(1)

    print(f"  ✓ {path}")


print()
print("All required files found.")
print()


# ============================================================
# LOAD SIKKIM BOUNDARY
# ============================================================

print("Loading Sikkim boundary...")

boundary = gpd.read_file(SIKKIM_BOUNDARY)

print(f"  Boundary CRS: {boundary.crs}")

# Convert boundary to WGS84 because historical CSV coordinates
# are latitude/longitude.
boundary = boundary.to_crs("EPSG:4326")

sikkim_geometry = unary_union(boundary.geometry)

print("  ✓ Sikkim boundary loaded.")
print()


# ============================================================
# LOAD HISTORICAL LANDSLIDES
# ============================================================

print("Loading historical landslides...")

landslides = pd.read_csv(LANDSLIDE_CSV)

print(f"  Total historical records: {len(landslides)}")

print()
print("  Columns:")
for column in landslides.columns:
    print(f"    - {column}")

print()


# ============================================================
# CREATE POINT GEOMETRIES
# ============================================================

# Your CSV uses latitude / longitude.
landslide_points = gpd.GeoDataFrame(
    landslides.copy(),

    geometry=gpd.points_from_xy(
        landslides["longitude"],
        landslides["latitude"]
    ),

    crs="EPSG:4326"
)


# ============================================================
# FILTER TO ACTUAL SIKKIM BOUNDARY
# ============================================================

print("Filtering historical landslides to Sikkim...")

inside_sikkim = (
    landslide_points.geometry.within(sikkim_geometry)
    |
    landslide_points.geometry.touches(sikkim_geometry)
)

sikkim_landslides = landslide_points[
    inside_sikkim
].copy()

print()
print(
    f"  Historical landslides inside Sikkim: "
    f"{len(sikkim_landslides)}"
)

print()


if len(sikkim_landslides) == 0:

    print("ERROR: No historical landslides were found inside")
    print("the supplied Sikkim boundary.")

    raise SystemExit(1)


# ============================================================
# OPEN DEM
# ============================================================

print("Opening DEM...")

with rasterio.open(DEM_PATH) as dem:

    print()
    print("DEM information:")
    print(f"  CRS:       {dem.crs}")
    print(f"  Width:     {dem.width}")
    print(f"  Height:    {dem.height}")
    print(f"  Resolution:{dem.res}")
    print(f"  Bounds:    {dem.bounds}")
    print()

    reference = dem

    # --------------------------------------------------------
    # READ ALL RASTERS
    # --------------------------------------------------------

    print("Loading raster layers...")

    dem_array = dem.read(1, masked=True)

    slope_array = read_aligned_raster(
        SLOPE_PATH,
        reference,
        Resampling.nearest
    )

    aspect_array = read_aligned_raster(
        ASPECT_PATH,
        reference,
        Resampling.nearest
    )

    print("  NDVI may take some time because the file is large...")

    ndvi_array = read_aligned_raster(
        NDVI_PATH,
        reference,
        Resampling.bilinear
    )

    soil_array = read_aligned_raster(
        SOIL_PATH,
        reference,
        Resampling.bilinear
    )

    print()
    print("✓ All raster layers loaded.")
    print()


    # ========================================================
    # POSITIVE SAMPLES
    # ========================================================

    print("=" * 70)
    print("CREATING POSITIVE SAMPLES")
    print("=" * 70)

    positive = sikkim_landslides.copy()

    xs = positive.geometry.x.to_numpy()
    ys = positive.geometry.y.to_numpy()

    print(f"Extracting raster values for {len(positive)} landslides...")


    elevation_values = extract_values_from_array(
        dem_array,
        xs,
        ys,
        reference
    )

    slope_values = extract_values_from_array(
        slope_array,
        xs,
        ys,
        reference
    )

    aspect_values = extract_values_from_array(
        aspect_array,
        xs,
        ys,
        reference
    )

    ndvi_values = extract_values_from_array(
        ndvi_array,
        xs,
        ys,
        reference
    )

    soil_values = extract_values_from_array(
        soil_array,
        xs,
        ys,
        reference
    )


    positive_df = pd.DataFrame({

        "latitude": ys,

        "longitude": xs,

        "elevation_m": elevation_values,

        "slope_deg": slope_values,

        "aspect_deg": aspect_values,

        "ndvi": ndvi_values,

        "soil_moisture": soil_values,

        "landslide": 1,

        "sample_type": "historical_positive",

        "event_id": positive["event_id"].to_numpy(),

        "event_date": positive["event_date"].to_numpy(),

    })


    # ========================================================
    # ASPECT TRANSFORMATION
    # ========================================================

    # Aspect is circular.
    #
    # 359 degrees and 1 degree are very close geographically,
    # even though numerically they look very far apart.
    #
    # Therefore we provide sin/cos representations.

    positive_df["aspect_sin"] = np.sin(
        np.deg2rad(positive_df["aspect_deg"])
    )

    positive_df["aspect_cos"] = np.cos(
        np.deg2rad(positive_df["aspect_deg"])
    )


    # ========================================================
    # CREATE SIKKIM MASK
    # ========================================================

    print()
    print("=" * 70)
    print("CREATING NEGATIVE SAMPLES")
    print("=" * 70)

    # Convert Sikkim boundary to DEM CRS.
    boundary_dem = boundary.to_crs(reference.crs)

    boundary_geometry_dem = unary_union(
        boundary_dem.geometry
    )


    # True for pixels INSIDE Sikkim.
    sikkim_mask = geometry_mask(

        [boundary_geometry_dem],

        out_shape=(
            reference.height,
            reference.width
        ),

        transform=reference.transform,

        invert=True
    )


    # ========================================================
    # FIND VALID PIXELS
    # ========================================================

    valid_mask = sikkim_mask.copy()


    # Pixel must have valid values in every feature.
    valid_mask &= ~np.ma.getmaskarray(dem_array)

    valid_mask &= ~np.ma.getmaskarray(slope_array)

    valid_mask &= ~np.ma.getmaskarray(aspect_array)

    valid_mask &= ~np.ma.getmaskarray(ndvi_array)

    valid_mask &= ~np.ma.getmaskarray(soil_array)


    # ========================================================
    # EXCLUDE AREA AROUND KNOWN LANDSLIDES
    # ========================================================

    print(
        f"Excluding pixels within "
        f"{EXCLUSION_DISTANCE_METERS}m "
        f"of historical landslides..."
    )

    historical_points_dem = (
        sikkim_landslides
        .to_crs(reference.crs)
    )

    historical_union = unary_union(
        historical_points_dem.geometry
    )

    exclusion_geometry = historical_union.buffer(
        EXCLUSION_DISTANCE_METERS
    )


    exclusion_mask = geometry_mask(

        [exclusion_geometry],

        out_shape=(
            reference.height,
            reference.width
        ),

        transform=reference.transform,

        invert=True
    )


    # Remove pixels close to known landslides.
    valid_mask &= ~exclusion_mask


    # ========================================================
    # FIND AVAILABLE NEGATIVE PIXELS
    # ========================================================

    rows, cols = np.where(valid_mask)

    print(
        f"  Valid candidate non-landslide pixels: "
        f"{len(rows):,}"
    )


    # ========================================================
    # SAMPLE NEGATIVES
    # ========================================================

    number_of_positive_samples = len(
        positive_df
    )

    number_of_negative_samples = int(
        number_of_positive_samples
        * NEGATIVE_RATIO
    )


    if number_of_negative_samples > len(rows):

        number_of_negative_samples = len(rows)


    print(
        f"  Positive samples: {number_of_positive_samples}"
    )

    print(
        f"  Negative samples requested: "
        f"{number_of_negative_samples}"
    )


    rng = np.random.default_rng(
        RANDOM_SEED
    )


    selected_indices = rng.choice(

        len(rows),

        size=number_of_negative_samples,

        replace=False

    )


    selected_rows = rows[
        selected_indices
    ]

    selected_cols = cols[
        selected_indices
    ]


    # ========================================================
    # CONVERT PIXELS TO COORDINATES
    # ========================================================

    negative_x, negative_y = rasterio.transform.xy(

        reference.transform,

        selected_rows,

        selected_cols,

        offset="center"

    )


    negative_x = np.array(
        negative_x
    )

    negative_y = np.array(
        negative_y
    )


    # ========================================================
    # EXTRACT NEGATIVE FEATURES
    # ========================================================

    negative_df = pd.DataFrame({

        "latitude": negative_y,

        "longitude": negative_x,

        "elevation_m": np.asarray(
            dem_array
        )[selected_rows, selected_cols],

        "slope_deg": np.asarray(
            slope_array
        )[selected_rows, selected_cols],

        "aspect_deg": np.asarray(
            aspect_array
        )[selected_rows, selected_cols],

        "ndvi": np.asarray(
            ndvi_array
        )[selected_rows, selected_cols],

        "soil_moisture": np.asarray(
            soil_array
        )[selected_rows, selected_cols],

        "landslide": 0,

        "sample_type": "random_nonlandslide",

        "event_id": "",

        "event_date": "",

    })


    # Aspect circular transformation.

    negative_df["aspect_sin"] = np.sin(
        np.deg2rad(
            negative_df["aspect_deg"]
        )
    )

    negative_df["aspect_cos"] = np.cos(
        np.deg2rad(
            negative_df["aspect_deg"]
        )
    )


# ============================================================
# COMBINE DATA
# ============================================================

print()
print("=" * 70)
print("CREATING FINAL DATASET")
print("=" * 70)


final_df = pd.concat(

    [
        positive_df,
        negative_df
    ],

    ignore_index=True

)


# ============================================================
# REMOVE INVALID ROWS
# ============================================================

feature_columns = [

    "elevation_m",

    "slope_deg",

    "aspect_deg",

    "aspect_sin",

    "aspect_cos",

    "ndvi",

    "soil_moisture"

]


before = len(final_df)


final_df = final_df.dropna(

    subset=feature_columns

).reset_index(drop=True)


after = len(final_df)


print(
    f"Removed {before - after} rows "
    f"with missing feature values."
)


# ============================================================
# SHUFFLE
# ============================================================

final_df = final_df.sample(

    frac=1,

    random_state=RANDOM_SEED

).reset_index(drop=True)


# ============================================================
# SAVE
# ============================================================

final_df.to_csv(

    OUTPUT_PATH,

    index=False

)


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("DONE!")
print("=" * 70)

print()

print(f"Output:")
print(f"  {OUTPUT_PATH}")

print()

print(
    f"Total rows: {len(final_df):,}"
)

print()

print("Class distribution:")

print(
    final_df["landslide"]
    .value_counts()
    .sort_index()
)

print()

print("Features:")

for feature in feature_columns:

    print(
        f"  {feature}"
    )

print()

print("Dataset preview:")

print(
    final_df.head(10).to_string(
        index=False
    )
)

print()
print("=" * 70)
print("You can now train an ML model from this CSV.")
print("=" * 70)