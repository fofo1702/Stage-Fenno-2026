# Order Analytics – SAP UI Integration Card

A **column chart** Integration Card that shows the completeness percentage of order fields (Order Date, Order ID, Currency, Price). Designed for deployment to **SAP Work Zone Advanced**.

---

## Project structure

```
graphcard/
├── manifest.json          ← Card manifest (Analytical / column chart)
├── preview.html           ← Local browser preview
├── package.json           ← npm helpers (local serve)
├── mta.yaml               ← MTA deployment descriptor (BTP / Work Zone)
├── i18n/
│   └── i18n.properties    ← All UI texts (translatable)
└── dt/
    └── Configuration.js   ← Design-time editor for Work Zone admins
```

---

## Chart overview

| Axis | Content |
|------|---------|
| X-axis (categoryAxis) | Order Date · Order ID · Currency · Price |
| Y-axis (valueAxis) | Percentage 0 – 100 % |

Sample data (replace with a real OData / REST call when needed):

| Category   | % |
|------------|---|
| Order Date | 95 |
| Order ID   | 100 |
| Currency   | 87 |
| Price      | 72 |

---

## Local preview

```bash
# option 1 – plain http-server (Node.js)
npm install
npm run serve
# then open http://localhost:4000/preview.html

# option 2 – Python (no install required)
python3 -m http.server 4000
# then open http://localhost:4000/preview.html
```

---

## Deploy to SAP Work Zone Advanced

### Option A – Upload via Work Zone Admin UI (quickest)

1. Zip the card folder:
   ```bash
   cd /home/user/projects
   zip -r graphcard.zip graphcard/
   ```
2. Open **SAP BTP Cockpit → Work Zone Advanced → UI Integration Cards**.
3. Click **Upload** and select `graphcard.zip`.

### Option B – MTA deployment (CI/CD)

Prerequisites: BTP Cloud Foundry environment, MTA Build Tool (`mbt`), CF CLI.

```bash
# 1. Install MTA Build Tool (if not already installed)
npm install -g mbt

# 2. Build the MTA archive
cd /home/user/projects/graphcard
mbt build

# 3. Deploy to Cloud Foundry
cf login -a <API_ENDPOINT> -o <ORG> -s <SPACE>
cf deploy mta_archives/graphcard-order-analytics_1.0.0.mtar
```

After deployment, add the card to a Work Zone page via **Page Designer**.

---

## Connect to a real data source

Replace the inline `data.json` block in `manifest.json` with a network request:

```json
"data": {
  "request": {
    "url": "{{destinations.myBackend}}/OrderMetrics"
  },
  "path": "/metrics"
},
"configuration": {
  "destinations": {
    "myBackend": {
      "name": "MY_BACKEND_DESTINATION"
    }
  }
}
```

Update the dimensions/measures `value` bindings to match the response fields.
