# Training Tracker UI Card - Deployment Guide

## Overview
This package contains a SAPUI5 Integration Card for displaying training hours tracking data from the `/srv/training-reports` endpoint.

## Project Structure

```
training_tracker/
├── manifest.json                    (Package manifest - describes the card package)
├── content.json                     (Content descriptor - lists card and role for deployment)
├── i18n/                            (Package-level internationalization)
│   ├── i18n.properties
│   └── i18n_en.properties
├── preview.html                     (Local preview page for testing)
└── training_hours/                  (Card folder)
    ├── manifest.json                (Card manifest - defines the Analytical card)
    ├── manifest.preview.json        (Card manifest with mock data for local testing)
    ├── role.json                    (Card role for Work Zone assignment)
    └── i18n/                        (Card-level internationalization)
        ├── i18n.properties
        └── i18n_en.properties
```

## Key Identifiers

- **Package ID**: `ns.training_tracker`
- **Card ID**: `ns.training_tracker.training_hours`
- **Card App ID**: `ns.training_tracker.training_hours.app`
- **Role ID**: `training.role`

## Deployment to Work Zone

### 1. Build the Package
Run the build process (specific tool depends on your DevOps setup):
```bash
# Build the package
npm run build
# or
gradle build
# or equivalent for your environment
```

This will process `content.json` and prepare the package for deployment.

### 2. Deploy to BTP
- Upload the built package to your BTP subaccount
- The deployment includes:
  - **Card**: `ns.training_tracker.training_hours` with manifest at `training_hours/manifest.json`
  - **Role**: `training.role` with assignment of the card app

### 3. Assign to Work Zone
In Work Zone admin interface:
1. Open **Apps** section
2. Search for "Training Hours per Year"
3. Assign the `training.role` to business catalogs/spaces as needed

### 4. Users Access
Users assigned to the role will see the card in their Work Zone dashboard.

## Data Source

**Endpoint**: `https://flexso-consumer-devtrt-dev.cfapps.eu10.hana.ondemand.com/srv/training-reports`

**Data Fields Used**:
- `year` - Calendar year (2024, 2025, etc.)
- `spentHours` - Training hours already completed
- `plannedHours` - Planned training hours for the year

**Visualization**:
- Stacked column chart
- Dark blue (#0070F2): Spent hours
- Light blue (#91C8F6): Planned hours
- X-axis: Year
- Y-axis: Hours
- Legend: Bottom

## Local Testing

### Prerequisites
- Node.js and npm installed
- HTTP server for CORS-free local preview

### Test with Mock Data
```bash
# Start local preview server
npx http-server . -p 4000 -c-1 --cors

# Open in browser
http://127.0.0.1:4000/preview.html
```

The `preview.html` uses `manifest.preview.json` with embedded mock data to test the UI without calling the live API.

### Test with Real API (requires authentication)
Use the production manifest directly in your Work Zone instance or authenticated BTP environment.

## Customization

### Titles and Labels
Edit the i18n files:
- `i18n/i18n.properties` - Package labels
- `training_hours/i18n/i18n.properties` - Card labels

### Chart Colors
Edit `training_hours/manifest.json` → `sap.card.content.chartProperties.plotArea.colorPalette`

### Data Fields
If the API returns different field names, update the `measures` mappings in `training_hours/manifest.json`:
```json
"measures": [
  { "name": "Spent Hours",   "value": "{fieldName1}" },
  { "name": "Planned Hours", "value": "{fieldName2}" }
]
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Card shows "No data to display" | Verify API is returning data; check network tab for response |
| Chart doesn't render | Ensure `chartType`, `measures`, `dimensions`, and `feeds` are correctly configured |
| i18n strings show as keys | Verify i18n file paths and keys match manifest bindings |
| Preview shows CORS error | CORS error only affects localhost; production deployment via Work Zone has no CORS restrictions |

## Support

- API Endpoint: Check with your backend team for availability and authentication requirements
- UI5 Documentation: https://ui5.sap.com/
- Integration Cards Guide: https://ui5.sap.com/test-resources/sap/ui/integration/demokit/cardExplorer/
