import argparse,os,joblib,numpy as np,rasterio
p=argparse.ArgumentParser();[p.add_argument("--"+x,required=True) for x in ["model","elevation","slope","aspect","ndvi","soil-moisture"]];p.add_argument("--out-dir",default="predictions");a=p.parse_args();paths={"elevation_m":a.elevation,"slope_deg":a.slope,"aspect_deg":a.aspect,"ndvi":a.ndvi,"soil_moisture":a.soil_moisture};A={};profile=None
for n,path in paths.items():
 with rasterio.open(path) as s:
  arr=s.read(1).astype("float32")
  if profile is None: profile=s.profile.copy();shape=arr.shape;transform=s.transform;crs=s.crs
  elif arr.shape!=shape or s.transform!=transform or s.crs!=crs: raise ValueError("Input rasters are not aligned")
  A[n]=arr
r=np.deg2rad(A["aspect_deg"]);A["aspect_sin"]=np.sin(r);A["aspect_cos"]=np.cos(r);b=joblib.load(a.model);F=b["features"];stack=np.stack([A[f] for f in F],-1);valid=np.all(np.isfinite(stack),-1);flat=stack.reshape(-1,len(F));out=np.full(flat.shape[0],-9999.,np.float32);out[valid.ravel()]=b["model"].predict_proba(flat[valid.ravel()])[:,1];out=out.reshape(valid.shape);risk=np.zeros(valid.shape,np.uint8);risk[valid&(out<.33)]=1;risk[valid&(out>=.33)&(out<.66)]=2;risk[valid&(out>=.66)]=3;os.makedirs(a.out_dir,exist_ok=True);pp=profile.copy();pp.update(dtype="float32",count=1,nodata=-9999,compress="deflate");rp=profile.copy();rp.update(dtype="uint8",count=1,nodata=0,compress="deflate");
with rasterio.open(os.path.join(a.out_dir,"landslide_risk_probability.tif"),"w",**pp) as d:d.write(out,1)
with rasterio.open(os.path.join(a.out_dir,"landslide_risk_level.tif"),"w",**rp) as d:d.write(risk,1)
