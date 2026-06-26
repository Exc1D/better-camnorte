#!/usr/bin/env python3
"""Convert DPWH flood-hazard shapefiles to web-ready GeoJSON.

Source shapefiles are survey-precision (millions of vertices). We simplify
per-feature and quantize coordinates so the overlay is small enough to serve
statically. `Var` (1/2/3 = low/medium/high hazard) is preserved for styling.

Output lands in data/flood/ (passthrough-copied to /data/flood/*.geojson).
Re-run if the source shapefiles change:

    pip install pyshp shapely
    FLOOD_SRC_ROOT=/path/to/shapefiles python3 scripts/convert-flood-shp.py

SRC_ROOT defaults to ~/Downloads; override with FLOOD_SRC_ROOT.
"""
import json
import os
import shapefile
from shapely.geometry import shape, mapping

TOLERANCE = 0.002  # ~200m; fine for a provincial overlay at zoom 10-13
PRECISION = 5      # decimal places (~1m) after simplify

LAYERS = [
    ("CamarinesNorte5/CamarinesNorte_Flood_5year.shp", "flood-5yr.geojson"),
    ("CamarinesNorte25/CamarinesNorte_Flood_25year.shp", "flood-25yr.geojson"),
    ("CamarinesNorte100/CamarinesNorte_Flood_100year.shp", "flood-100yr.geojson"),
]
SRC_ROOT = os.environ.get("FLOOD_SRC_ROOT", os.path.expanduser("~/Downloads"))
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "flood")


def round_coords(geom, p):
    if isinstance(geom, (list, tuple)):
        if geom and isinstance(geom[0], (int, float)):
            return [round(geom[0], p), round(geom[1], p)]
        return [round_coords(g, p) for g in geom]
    return geom


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for src, out in LAYERS:
        r = shapefile.Reader(os.path.join(SRC_ROOT, src))
        features = []
        # iterShapeRecords streams; shapeRecords() loads all at once and the
        # 100yr layer (94MB, 2.6M-pt shapes) peaks ~1GB even streaming.
        for sr in r.iterShapeRecords():
            # preserve_topology=False (Douglas-Peucker): the source polygons are
            # invalid with ~120k parts each; the topology-preserving path hangs/OOMs.
            # For a translucent hazard overlay, visual approximation is all we need.
            geom = shape(sr.shape.__geo_interface__).simplify(
                TOLERANCE, preserve_topology=False
            )
            if geom.is_empty:
                continue
            gj = mapping(geom)
            gj["coordinates"] = round_coords(gj["coordinates"], PRECISION)
            features.append(
                {
                    "type": "Feature",
                    "geometry": gj,
                    "properties": {"hazard": int(sr.record[0])},
                }
            )
        path = os.path.join(OUT_DIR, out)
        with open(path, "w") as f:
            json.dump({"type": "FeatureCollection", "features": features}, f)
        print(f"{out}: {len(features)} features, {os.path.getsize(path)/1024:.0f} KB")


if __name__ == "__main__":
    main()
