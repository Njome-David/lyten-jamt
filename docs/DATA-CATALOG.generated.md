# DATA-CATALOG.generated.md - Statut reel des endpoints NASA

> Genere automatiquement par `npm run data:probe` le 2026-11-15T11:18:40.838Z.
> Cle utilisee: DEMO_KEY.

## 1. Resume des statuts

| ID | Statut HTTP | Latence | Notes |
|---|---|---|---|
| `donki-flr (CCMC)` | 🟢 200 | 1270 ms | Endpoint CCMC actif, pas de cle requise, fenetre max 30 jours |
| `donki-cme (CCMC)` | 🟢 200 | 1361 ms | Endpoint CCMC actif |
| `donki-sep (CCMC)` | 🟢 200 | 285 ms | Endpoint CCMC actif |
| `donki-gst (CCMC)` | 🟢 200 | 456 ms | Endpoint CCMC actif |
| `donki-flr (legacy api.nasa.gov)` | 🔴 404 | 1267 ms | Ancienne URL api.nasa.gov (404 obselete) |
| `osdr` | 🔴 404 | 1141 ms | Endpoint OSDR a ajuster ou utiliser repo geode direct |
| `insight-weather` | 🟢 200 | 631 ms | Archive InSight fowards sols 675-681 |
| `image-library` | 🟢 200 | 1813 ms | NASA Image & Video Library active |
| `apod (legacy)` | 🟡 ERR | 15005 ms | Ancien endpoint APOD |
| `apod (science.nasa.gov)` | 🟢 200 | 803 ms | Nouvel endpoint APOD science.nasa.gov |
| `epic` | 🟢 200 | 1110 ms | EPIC DSCOVR actif |
| `sdo-latest-image` | 🟢 200 | 1282 ms | SDO image solaire active (image/jpeg) |

## 2. Details et extraits de reponse

### `donki-flr (CCMC)`

- **URL**: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=2026-10-26&endDate=2026-11-15`
- **Statut**: `200` (1270 ms)
- **Extrait**: `[{"flrID":"2026-10-26T08:21:00-FLR-001","catalog":"M2M_CATALOG","instruments":[{"displayName":"GOES-P: EXIS 1.0-8.0"}],"`
- **Note**: Endpoint CCMC actif, pas de cle requise, fenetre max 30 jours

### `donki-cme (CCMC)`

- **URL**: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/CME?startDate=2026-10-26&endDate=2026-11-15`
- **Statut**: `200` (1361 ms)
- **Extrait**: `[{"activityID":"2026-10-26T00:12:00-CME-001","catalog":"M2M_CATALOG","startTime":"2026-10-26T00:12Z","instruments":[{"di`
- **Note**: Endpoint CCMC actif

### `donki-sep (CCMC)`

- **URL**: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP?startDate=2026-10-26&endDate=2026-11-15`
- **Statut**: `200` (285 ms)
- **Extrait**: `[]`
- **Note**: Endpoint CCMC actif

### `donki-gst (CCMC)`

- **URL**: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/GST?startDate=2026-10-26&endDate=2026-11-15`
- **Statut**: `200` (456 ms)
- **Extrait**: `[{"gstID":"2026-10-31T18:00:00-GST-001","startTime":"2026-10-31T18:00Z","allKpIndex":[{"kpIndex":6.0,"observedTime":"202`
- **Note**: Endpoint CCMC actif

### `donki-flr (legacy api.nasa.gov)`

- **URL**: `https://api.nasa.gov/DONKI/FLR?startDate=2026-10-26&endDate=2026-11-15&api_key=REDACTED`
- **Statut**: `404` (1267 ms)
- **Extrait**: `{"timestamp":"2026-11-15T11:18:18.803Z","status":404,"error":"Not Found","path":"/DONKI-API/get/FLR/"}`
- **Note**: Ancienne URL api.nasa.gov (404 obselete)

### `osdr`

- **URL**: `https://osdr.nasa.gov/geode-py/ws/api/`
- **Statut**: `404` (1141 ms)
- **Extrait**: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"> <title>404 Not Found</title> <h1>Not Found</h1> <p>The requested`
- **Note**: Endpoint OSDR a ajuster ou utiliser repo geode direct

### `insight-weather`

- **URL**: `https://api.nasa.gov/insight_weather/?api_key=REDACTED&feedtype=json&ver=1.0`
- **Statut**: `200` (631 ms)
- **Extrait**: `{ "675": { "AT": { "av": -62.314, "ct": 177556, "mn": -96.872, "mx": -15.908 }, `
- **Note**: Archive InSight fowards sols 675-681

### `image-library`

- **URL**: `https://images-api.nasa.gov/search?q=perseverance%20mars&media_type=image`
- **Statut**: `200` (1813 ms)
- **Extrait**: `{"collection":{"version":"1.1","href":"http://images-api.nasa.gov/search?q=perseverance%20mars&media_type=image","items"`
- **Note**: NASA Image & Video Library active

### `apod (legacy)`

- **URL**: `https://api.nasa.gov/planetary/apod?api_key=REDACTED`
- **Statut**: `ERR` (15005 ms)
- **Extrait**: `The operation was aborted due to timeout`
- **Note**: Ancien endpoint APOD

### `apod (science.nasa.gov)`

- **URL**: `https://science.nasa.gov/wp-json/wp/v2/apod-basic`
- **Statut**: `200` (803 ms)
- **Extrait**: `[{"date":"2026-11-15","post_id":1511419,"title":"Leonid Meteors Through Orion","permalink":"https://science.nasa.gov/ima`
- **Note**: Nouvel endpoint APOD science.nasa.gov

### `epic`

- **URL**: `https://epic.gsfc.nasa.gov/api/natural`
- **Statut**: `200` (1110 ms)
- **Extrait**: `[{"identifier":"20261112000830","caption":"This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft`
- **Note**: EPIC DSCOVR actif

### `sdo-latest-image`

- **URL**: `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg`
- **Statut**: `200` (1282 ms)
- **Extrait**: `[image/jpeg]`
- **Note**: SDO image solaire active (image/jpeg)

