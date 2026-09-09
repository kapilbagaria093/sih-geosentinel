import argparse,joblib,pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
F=["elevation_m","slope_deg","aspect_sin","aspect_cos","ndvi","soil_moisture"]
p=argparse.ArgumentParser();p.add_argument("--csv",required=True);p.add_argument("--out",default="landslide_risk_model.joblib");a=p.parse_args();d=pd.read_csv(a.csv);Xtr,Xte,ytr,yte=train_test_split(d[F],d.landslide.astype(int),test_size=.2,stratify=d.landslide,random_state=42);m=Pipeline([("imputer",SimpleImputer(strategy="median")),("rf",RandomForestClassifier(n_estimators=400,max_depth=18,min_samples_leaf=3,class_weight="balanced",random_state=42,n_jobs=-1))]);m.fit(Xtr,ytr);joblib.dump({"model":m,"features":F,"thresholds":{"low":.33,"moderate":.66}},a.out);print("trained")
