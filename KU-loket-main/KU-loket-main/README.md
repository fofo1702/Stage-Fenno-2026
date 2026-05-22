# KU Loket - Academic Results Integration Card

## Overview
This project contains a SAPUI5 Integration Card that displays academic exam results and grades in a table format.

## Project Structure
```
 manifest.json        # Package manifest and configuration
 card.json           # Integration Card definition (Table type)
 roles.json          # Role definitions for deployment
 test.html           # Local test page to preview the card
 content.json        # Content configuration
 i18n/               # Internationalization files
   ├── i18n.properties
   └── i18n_en.properties
 README.md           # This file
```

## Files Created

### 1. **card.json** - Integration Card Definition
- **Type**: Table Integration Card
- **Title**: "Mijn Resultaten" (My Results)
- **Subtitle**: Bachelor Electronica-ICT (Sint-Katelijne-Waver)
- **Data**: 12 sample exam results with the following columns:
  - Opleiding/onderwerp (Subject)
  - Resultaat (Result/Score)
  - Datum (Date)
  - Sp (Study Points)
  - Attempt (Number of Attempts)
  - Aantal keer opgehaald (Times Retrieved)

### 2. **test.html** - Local Testing Environment
A standalone HTML file that allows you to preview the card locally using the SAPUI5 framework.

**Features**:
- Loads SAPUI5 libraries from CDN
- Beautiful gradient background and card styling
- Displays card information panel
- No server or build process needed

**How to Use**:
1. Open `test.html` in your web browser
2. The card will load and display the exam results table
3. Check the browser console for debugging information

### 3. **roles.json** - Deployment Role Configuration
Defines two roles for work zone deployment:

#### Role 1: `KU_LOKET_CARD_USER`
- **Purpose**: For end users (students, employees)
- **Default**: Yes
- **Permissions**: 
  - VIEW_CARD
  - VIEW_RESULTS
  - VIEW_GRADES

#### Role 2: `KU_LOKET_CARD_ADMIN`
- **Purpose**: For administrators and managers
- **Default**: No
- **Permissions**: 
  - All user permissions plus
  - MANAGE_CARD
  - EDIT_CARD_CONFIG
  - DEPLOY_CARD
  - VIEW_ANALYTICS

## Deployment to Work Zone

### Step 1: Package the Card
Package your card files for deployment to SAP Work Zone.

### Step 2: Assign Roles
When deploying to work zone, use the roles defined in `roles.json`:

```
Role: KU_LOKET_CARD_USER
Assign to: Students, Employees who need to view their grades
```

```
Role: KU_LOKET_CARD_ADMIN
Assign to: System administrators, IT managers
```

### Step 3: Configure Access
In Work Zone administration:
1. Go to role assignments
2. Select `KU_LOKET_CARD_USER` role
3. Assign to user groups or individuals
4. The card will appear in their workspace

## Local Testing

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (to load SAPUI5 libraries from CDN)

### Running the Test
1. Navigate to your project directory
2. Open `test.html` in your browser
3. The card and sample data will display

### Troubleshooting
- If the card doesn't load, check browser console (F12) for errors
- Ensure you have internet access (CDN libraries are loaded externally)
- Check that `card.json` is in the same directory as `test.html`

## Card Data Configuration

The card currently uses embedded JSON data. To connect to a live data source:

1. Update `card.json` with your OData service URL
2. Replace the `data` section with:
```json
"data": {
  "request": {
    "url": "/your-odata-service/Results"
  }
}
```

## Configuration

### Card Manifest
Update `manifest.json` to include:
```json
"destinations": [
  {
    "name": "student-service",
    "url": "https://your-api-endpoint"
  }
]
```

## Support
For questions or issues with this Integration Card:
- Check SAP UI5 documentation: https://ui5.sap.com/
- Review Integration Cards guide: https://ui5.sap.com/#/topic/7379a755393c47857212b46a349120c8
- Contact your system administrator for deployment

## Version
- Card Version: 1.0.0
- Package ID: ns.ku_loket
- Framework: SAPUI5 1.120 and above
- Card Type: Table
