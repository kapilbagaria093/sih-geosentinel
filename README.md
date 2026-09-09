# SIH 2026 Project Repository --- GeoSentinel

Our project, **GEOSENTINEL** aims to build a portal which collects and analyzes data from various sources to provide insights on landslide susceptibility and risk prediction of the area. The portal will leverage AI and machine learning techniques to predict landslide risks on the basis of geological data of the area. We also aim to build a pipeline for automated data ingestion, preprocessing, and CSV building (for ML model data), clipping, etc., so it can be served to the frontend for live data.

Another major part of our project is to build a efficient reliable incident reporting system for people to report landslide incidents so, others in the area can be warned via. built-in alerts and notifications system through messages, whatsapp, etc channels. The system will also provide a dashboard for authorities to monitor and respond to incidents in real-time.

## 1. Project Information

- **Project Title:** GeoSentinel – ML Landlslide Risk Prediction and Incident Reporting System
- **PS ID:** SIH26001
- **PS Title:** AI-Based early warning and landslide Risk Monitoring System in NER
- **Category:** Software
- **Theme:** Disaster Management

## 2. Problem Statement

Farmers may have difficulty identifying crop diseases at an early stage. Manual identification can be slow and may depend on access to agricultural experts.The North Eastern Region (NER) frequently faces landslides, flash floods, road blockages, and slope failures due to heavy rainfall, fragile terrain, and unplanned hill cutting. These incidents often disrupt connectivity, damage infrastructure, delay emergency response, and isolate remote villages for days. Currently, monitoring of vulnerable zones is mostly reactive and dependent on manual reporting. There is limited use of real-time predictive systems for identifying high-risk zones and issuing early warnings to authorities and local communities. With increasing climate vulnerability in the region, there is a need for an AI-enabled real-time monitoring and prediction system that can help authorities take preventive action before disasters occur.

## 3. Proposed Solution

GeoSentinel aims to build a portal that collects and analyzes data from various sources to provide insights on landslide susceptibility and risk prediction of the area. The portal will leverage AI and machine learning techniques to predict landslide risks based on geological data of the area. We also aim to build a pipeline for automated data ingestion, preprocessing, and CSV building (for ML model data), clipping, etc., so it can be served to the frontend for live data.

## 4. Key Features

- Reliable Incident Reporting System including photo/video support, severity level, and location tagging.
- Offline Alerts if a user is in a landslide-prone area, even without internet connectivity.
- Public Interactive Map Dashboard interface to monitor and study landslide prone areas, with real-time satellites and sensor data visualisation. 
- AI/ML backed, risk visualisation and prediction system for landslide susceptibility and risk assessment.
- Selective Alerts Support for users to receive alerts based on their location and preferences. (Users can select specific districts and receive alerts only for those areas.)
- Minimum User Data Requirement for reporting incidents, ensuring ease of use.

## 5. Technology Stack

- Frontend: TypeScript, React.js, Leaflet.js, Tailwind
- Backend: JavaScript, Express.js, Geotiff (for satellite data processing), GDAL (for geospatial data processing)
- Machine Learning: Numpy, Pandas, Scikit-Learn, Rasterio (for geo-spatial processing), Random Forest Classifier (primary model for prediction)
- Database: PostgreSQL, PostGIS, Cloudinary (for object storage)

## 6. Architecture

See [docs/architecture.md](docs/architecture.md).

        User   <---------------------
        |                            |
        |(incident reports)          |
        |                            |    
        v                            | (landslide alerts)
        Frontend                     | (geospatial data)
        |                            |                
        v                            |
        Backend API -----------------
        |
        +----> Database
        |
        +----> Satellite Data Module
        |
        v
        ML Model
        |
        v
        Prediction


## 7. Repository Structure

```text
SIH-GEOSENTINEL/
├── README.md
├── submission/
│   ├── PRESENTATION.md
│   └── DEMO.md
├── geosentinel-backend-api/
│   └── src/
│       └── index.js
├── geosentinel-frontend-client/
│   └── src/
│   └── index.html
├── docs/
│   └── architecture.md
└── assets/
    └── screenshots/
```

| Item | Location |
|---|---|
| Backend API Source code | `geosentinel-backend-api/` |
| Frontend Client Source code | `geosentinel-frontend-client/` |
| Architecture / technical documentation | `docs/` |
| Project screenshots / hardware photos | `screenshots/` |
| Final PPT / presentation | `submission/PRESENTATION.md` |
| Demo video link | `submission/DEMO.md` |
| Project overview | `README.md` |


## 11. Installation and Setup Instructions

### (i) Download the repository: 
```bash
git clone 'https://github.com/kapilbagaria093/sih-geosentinel.git'
```
Note: After downloading the repository, rename '.env.example' to '.env' in 'geosentinel-backend-api/' and 'geosentinel-frontend-client/', and fill in the required environment variables.
### (ii) On a new terminal, run the following to setup and run the backend server: 
```bash
cd geosentinel-backend-api
npm install
npm run dev
```
### (iii) On a new terminal, run the following to setup and run the frontend client application: 
```bash
cd geosentinel-frontend-api
npm install
npm run dev
```

## 13. Future Scope

- Improving ML model accuracy by using more data and testing out more advanced techniques. 
- Adding more features, such as AI image analysis to rank severity of landslide reports.
- Integrating with government disaster management systems for better coordination and response and resource management during time of crisis.