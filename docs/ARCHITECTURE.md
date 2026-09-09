# GeoSentinel Architecture

## 1. Overview

GeoSentinel is an AI-enabled landslide risk monitoring and incident
reporting platform designed for the North Eastern Region (NER) of India.

The system combines:

-   Geospatial and satellite-derived data processing
-   Machine-learning-based landslide susceptibility and risk prediction
-   Interactive map-based visualization
-   Public incident reporting
-   Location-aware alerts and notifications
-   Authority-facing incident monitoring and response
-   Automated data ingestion and preprocessing workflows

The architecture is organized into a web client, backend API, geospatial
data-processing modules, machine-learning pipeline, and persistent
data/storage services.

------------------------------------------------------------------------

## 2. High-Level Architecture

``` mermaid
flowchart TB
    U[Public Users] --> FE[React + Leaflet Frontend]
    A[Authorities] --> FE

    FE --> API[Express.js Backend API]

    API --> DB[(PostgreSQL + PostGIS)]
    API --> GEO[Geospatial / Satellite Data Module]
    API --> IR[Incident Reporting Module]
    API --> AL[Alerts & Notifications Module]
    API --> REP[Reporting / Monitoring Module]

    GEO --> RASTER[GeoTIFF / GDAL Processing]
    RASTER --> DATA[Processed Geospatial Layers]

    DATA --> ML[Python ML Pipeline]
    ML --> MODEL[Random Forest Model]
    MODEL --> PRED[Spatial Risk Predictions]

    PRED --> API
    DB --> API

    IR --> DB
    AL --> DB
    REP --> DB
    REP --> PRED

    API --> FE
```

At a high level, users interact with the React frontend. Requests are
handled by the Express.js backend, which coordinates database
operations, geospatial processing, incident workflows, alerts,
reporting, and ML-generated predictions.

------------------------------------------------------------------------

## 3. Technology Stack

### Frontend

-   TypeScript
-   React.js
-   Leaflet.js
-   Tailwind CSS

The frontend provides the interactive map interface, user-facing
incident reporting flows, risk visualization, alerts, and authority
monitoring interface.

### Backend

-   JavaScript
-   Express.js
-   GeoTIFF processing
-   GDAL

The backend exposes application APIs and coordinates application
workflows between the frontend, database, geospatial data, incident
system, and prediction pipeline.

### Machine Learning & Geospatial Processing

-   Python
-   NumPy
-   Pandas
-   Scikit-learn
-   Rasterio
-   Random Forest Classifier

The ML subsystem processes geospatial raster data and generates spatial
landslide-risk predictions.

### Database & Storage

-   PostgreSQL
-   PostGIS
-   Cloudinary

PostgreSQL/PostGIS is used for application and geospatial data, while
Cloudinary provides object storage for uploaded media associated with
incident reports.

------------------------------------------------------------------------

## 4. Core Components

### 4.1 Frontend Client

The frontend is the primary interface for public users and authorities.

Responsibilities include:

-   Interactive geospatial map visualization
-   Visualization of landslide-prone and predicted-risk areas
-   Visualization of satellite and sensor-derived information
-   Incident reporting
-   Location selection and tagging
-   Media submission
-   Severity selection
-   User alert preferences
-   Authority incident monitoring

The frontend communicates with the backend through application APIs
rather than directly accessing the database or ML model.

------------------------------------------------------------------------

### 4.2 Backend API

The Express.js backend acts as the central application layer.

Responsibilities include:

-   Serving frontend API requests
-   Managing incident-report workflows
-   Persisting application and geospatial information
-   Coordinating geospatial data processing
-   Providing prediction data to the frontend
-   Managing alert and notification workflows
-   Supporting authority monitoring and reporting
-   Handling uploaded incident media through object storage

The backend provides a single integration layer between the user-facing
application and the underlying data-processing and storage components.

------------------------------------------------------------------------

### 4.3 PostgreSQL + PostGIS

PostgreSQL provides persistent application data storage, while PostGIS
extends PostgreSQL with geospatial capabilities.

The database supports information required by the application,
including:

-   Incident records
-   Geographic locations
-   Incident severity
-   User alert preferences
-   Region/district information
-   Geospatial application data
-   Information required for authority monitoring

Using PostGIS allows geographic information to be stored and queried as
part of the application data layer.

------------------------------------------------------------------------

### 4.4 Geospatial Data Processing

GeoSentinel uses geospatial raster data as an important input to the
prediction and visualization pipeline.

The system uses:

-   GeoTIFF
-   GDAL
-   Rasterio

The geospatial processing workflow performs operations such as:

1.  Obtaining source geospatial datasets
2.  Preprocessing datasets
3.  Clipping datasets to the target region
4.  Preparing model-compatible inputs
5.  Serving processed layers to the application
6.  Producing raster-based prediction outputs

The processed geospatial layers can then be consumed by the frontend for
map-based visualization.

------------------------------------------------------------------------

## 5. Machine Learning Pipeline

The ML subsystem predicts landslide risk using geological,
environmental, and terrain-related features.

### Input Features

The implemented prediction workflow uses raster inputs including:

-   Elevation
-   Slope
-   Aspect
-   NDVI
-   Soil moisture

These are provided as GeoTIFF datasets.

### Pipeline

``` text
Raw / Source Geospatial Data
            |
            v
   Data Preprocessing
            |
            v
   Region-specific Clipping
            |
            v
 Feature / Raster Preparation
            |
            v
     Random Forest Model
            |
            v
  Pixel / Spatial Prediction
            |
            v
 Landslide Prediction Raster
            |
            v
 Backend / Map Visualization
```

The primary prediction model is a Random Forest classifier implemented
using Scikit-learn.

The model is trained from a prepared ML dataset and can subsequently be
used to generate spatial predictions from processed raster layers.

------------------------------------------------------------------------

## 6. Prediction Workflow

The prediction workflow operates on aligned geospatial raster inputs.

Conceptually:

``` text
dem.tif
slope.tif
aspect.tif
ndvi.tif
soil_moisture.tif
       |
       v
Rasterio / Feature Preparation
       |
       v
Random Forest Classifier
       |
       v
Spatial Landslide Prediction
       |
       v
Prediction Raster / Risk Layer
       |
       v
Interactive Frontend Map
```

The prediction output is spatially distributed, allowing risk
information to be visualized geographically rather than only as a single
value for an entire region.

------------------------------------------------------------------------

## 7. Incident Reporting Architecture

GeoSentinel provides an incident reporting workflow for members of the
public.

``` mermaid
flowchart LR
    USER[User] --> FORM[Incident Report Form]
    FORM --> API[Backend API]
    API --> MEDIA[Media Storage]
    API --> DB[(PostgreSQL + PostGIS)]
    DB --> DASH[Authority Dashboard]
    DB --> ALERT[Alert / Notification Engine]
    ALERT --> USERS[Relevant Users]
```

An incident report can contain:

-   Geographic location
-   Severity level
-   Supporting photo/video
-   Incident information

The backend persists the report and makes the information available to
the monitoring and alerting workflows.

Media associated with reports is stored through Cloudinary, while
application and location information is maintained through the backend
data layer.

------------------------------------------------------------------------

## 8. Alerts and Notifications

The alerting subsystem is designed to provide warnings to users who may
be affected by landslide incidents or risk conditions.

The system supports:

-   Location-aware alerts
-   User-selected geographic preferences
-   Selective district-based notifications
-   Offline alerts for users in landslide-prone areas
-   Messaging/notification channels

The notification workflow can be represented as:

``` text
Incident / Risk Event
        |
        v
Determine Affected Region
        |
        v
Match User Location / Preferences
        |
        v
Select Relevant Users
        |
        v
Generate Alert
        |
        v
Notification / Offline Delivery
```

Selective alerts reduce unnecessary notifications by allowing users to
receive alerts only for geographic areas relevant to them.

------------------------------------------------------------------------

## 9. Authority Monitoring Dashboard

The authority-facing interface provides operational visibility into
reported incidents and landslide-risk information.

``` mermaid
flowchart TB
    DB[(Incident + Geospatial Data)]
    PRED[ML Prediction Layers]

    DB --> DASH[Authority Dashboard]
    PRED --> DASH

    DASH --> MAP[Interactive Risk / Incident Map]
    DASH --> MON[Incident Monitoring]
    DASH --> RESP[Response & Follow-up]
```

The dashboard allows authorities to monitor incidents in real time and
use the available geospatial and prediction information to support
response decisions.

------------------------------------------------------------------------

## 10. Data Flow

The complete application data flow is:

``` text
                    ┌─────────────────────┐
                    │   Source Datasets   │
                    │ Satellite / Terrain │
                    └──────────┬──────────┘
                               |
                               v
                    ┌─────────────────────┐
                    │ Geospatial Pipeline │
                    │ GDAL / GeoTIFF /    │
                    │ Rasterio             │
                    └──────────┬──────────┘
                               |
                    ┌──────────┴──────────┐
                    |                     |
                    v                     v
          ┌──────────────────┐   ┌─────────────────┐
          │ Frontend Layers  │   │ ML Model Inputs │
          └────────┬─────────┘   └────────┬────────┘
                   |                      |
                   |                      v
                   |             ┌─────────────────┐
                   |             │ Random Forest   │
                   |             └────────┬────────┘
                   |                      |
                   |                      v
                   |             ┌─────────────────┐
                   |             │ Risk Predictions│
                   |             └────────┬────────┘
                   |                      |
                   └──────────┬───────────┘
                              v
                     ┌─────────────────┐
                     │ Express.js API  │
                     └────────┬────────┘
                              |
              ┌───────────────┼────────────────┐
              v               v                v
       ┌────────────┐  ┌──────────────┐  ┌─────────────┐
       │ PostGIS DB │  │ Incident /   │  │ Alerts &    │
       │            │  │ Reports      │  │ Notifications│
       └────────────┘  └──────────────┘  └─────────────┘
                              |
                              v
                     ┌─────────────────┐
                     │ React Frontend  │
                     │ + Authority UI  │
                     └─────────────────┘
```

------------------------------------------------------------------------

## 11. Separation of Responsibilities

The architecture separates the major responsibilities of the system:

  Layer                   Responsibility
  ----------------------- ---------------------------------------------
  React / Leaflet         User interaction and map visualization
  Express.js API          Application orchestration and API access
  PostgreSQL / PostGIS    Persistent and geospatial application data
  Cloudinary              Incident media object storage
  GDAL / GeoTIFF          Geospatial data processing
  Rasterio                Raster manipulation and ML data preparation
  Python / Scikit-learn   Model training and inference
  Random Forest           Landslide-risk classification
  Alerting system         Location-aware warning delivery
  Authority dashboard     Incident monitoring and response

This separation allows geospatial processing and ML workloads to remain
distinct from the user-facing application layer while still being
exposed through the backend.

------------------------------------------------------------------------

## 12. ML Model Training and Inference

Training and prediction are treated as separate operations.

### Training

``` text
Prepared ML CSV
      |
      v
Python Training Pipeline
      |
      v
Feature Processing
      |
      v
Random Forest Training
      |
      v
Saved Model
```

### Inference

``` text
Saved Random Forest Model
          +
Elevation Raster
          +
Slope Raster
          +
Aspect Raster
          +
NDVI Raster
          +
Soil Moisture Raster
          |
          v
   Prediction Pipeline
          |
          v
Spatial Risk Predictions
```

The application does not require model training every time it is run. A
trained model can be used by the prediction pipeline to generate
predictions from the prepared geospatial inputs.

------------------------------------------------------------------------

## 13. Scalability and Maintainability Considerations

The system is organized into independently understandable application
areas:

-   Frontend client
-   Backend API
-   Database layer
-   Geospatial processing
-   ML training/inference
-   Incident reporting
-   Alerting
-   Authority monitoring

This modular organization makes it possible to improve individual
components without redesigning the entire application.

For example:

-   The ML model can be improved without changing the frontend map
    interface.
-   Additional geospatial datasets can be incorporated into the
    preprocessing pipeline.
-   Additional notification channels can be added to the alerting
    workflow.
-   Authority monitoring capabilities can be expanded independently of
    public reporting.
-   Additional regions can be processed by supplying corresponding
    geospatial datasets.

------------------------------------------------------------------------

## 14. Repository Architecture

``` text
SIH-GEOSENTINEL/
├── README.md
├── submission/
│   ├── PRESENTATION.md
│   └── DEMO.md
│
├── geosentinel-backend-api/
│   └── src/
│       └── index.js
│
├── geosentinel-frontend-client/
│   ├── src/
│   └── index.html
│
├── docs/
│   └── architecture.md
│
└── assets/
    └── screenshots/
```

The repository separates the frontend and backend applications while
keeping architecture documentation and SIH submission material in
dedicated directories.

------------------------------------------------------------------------

## 15. End-to-End System Flow

The complete operational flow is:

``` text
                 USER / AUTHORITY
                       |
                       v
              React + Leaflet Client
                       |
                       v
                Express.js API
                       |
          ┌────────────┼────────────┐
          |            |            |
          v            v            v
     PostgreSQL    Incident      Geospatial
      + PostGIS    Reporting     Processing
          |            |            |
          |            |            v
          |            |       Processed Rasters
          |            |            |
          |            |            v
          |            |       ML Prediction
          |            |            |
          |            |            v
          |            |       Risk Layers
          |            |            |
          └────────────┴────────────┘
                       |
                       v
             Alerts / Notifications
                       |
                       v
                 Relevant Users
```

GeoSentinel therefore combines predictive analysis with an operational
incident-response workflow: geospatial data is processed into risk
information, users can report real-world incidents, relevant users can
receive warnings, and authorities can monitor and respond through the
same application.

------------------------------------------------------------------------

## 16. Design Goals

The architecture is designed around the following goals:

1.  **Real-world usability** --- provide both predictive risk
    information and mechanisms for reporting actual incidents.
2.  **Geospatial awareness** --- represent risk and incidents spatially
    so users and authorities can understand affected areas.
3.  **Automated processing** --- automate ingestion, preprocessing,
    clipping, dataset preparation, and prediction workflows.
4.  **Operational response** --- connect incident reports and risk
    information with alerts and authority monitoring.
5.  **Low-friction reporting** --- minimize the amount of information
    required from users when reporting an incident.
6.  **Modular engineering** --- separate frontend, backend, database,
    geospatial processing, and ML responsibilities.
7.  **Extensibility** --- allow additional datasets, prediction
    approaches, notification channels, and disaster-management
    integrations to be incorporated over time.
