# Training Tracker Card - Deployment Checklist

## ✓ Pre-Deployment Status

All files are correctly configured for Work Zone deployment.

### File Structure ✓
```
training_tracker/
├── manifest.json                         ✓ Package manifest
├── content.json                          ✓ Content descriptor (card + role)
├── DEPLOYMENT.md                         ✓ Deployment guide (THIS FILE)
├── preview.html                          ✓ Local testing page
├── i18n/
│   ├── i18n.properties                   ✓ Package labels (German)
│   └── i18n_en.properties                ✓ Package labels (English)
└── training_hours/
    ├── manifest.json                     ✓ Production card manifest
    ├── manifest.preview.json             ✓ Local testing manifest (mock data)
    ├── role.json                         ✓ Card role for Work Zone
    └── i18n/
        ├── i18n.properties               ✓ Card labels (German)
        └── i18n_en.properties            ✓ Card labels (English)
```

### Identifiers ✓
| Component | ID | Type |
|-----------|----|----|
| Package | `ns.training_tracker` | Package |
| Card | `ns.training_tracker.training_hours` | Card |
| Role | `training.role` | Role |
| App Reference | `ns.training_tracker.training_hours.app` | Role → App Link |

### Data Connection ✓
- **Endpoint**: `https://flexso-consumer-devtrt-dev.cfapps.eu10.hana.ondemand.com/srv/training-reports`
- **Chart Type**: `stacked_column`
- **Fields Mapped**:
  - Year: `{year}`
  - Spent Hours: `{spentHours}`
  - Planned Hours: `{plannedHours}`

### Chart Styling ✓
- **Colors**: Dark blue (`#0070F2`) + Light blue (`#91C8F6`)
- **Legend**: Bottom
- **Data Labels**: Hidden
- **Icon**: Learning assistant

## Deployment Steps

### 1. Prepare Build Environment
```bash
cd /home/user/projects/training_tracker
```

### 2. Build Package
According to your BTP/Work Zone deployment process:
- Run build tool → generates deployment artifact
- Artifact should include all files from `content.json`

### 3. Upload to BTP
- Upload built package to your SAP BTP subaccount
- Ensure deployment is successful

### 4. Configure in Work Zone
1. **Assign Role to Space/Catalog**
   - Go to Work Zone Admin Panel
   - Assign `training.role` to appropriate business catalogs

2. **Publish Changes**
   - Users see card in their Work Zone dashboard

### 5. Verify Deployment
- Check user dashboard for "Training Hours per Year" card
- Confirm chart displays training hours data
- Verify multi-language support works (Title changes based on browser language)

## Local Testing (Optional)

To test the card locally before deployment:

```bash
# Start test server
cd /home/user/projects/training_tracker
npx http-server . -p 4000 -c-1 --cors

# Open in browser
http://127.0.0.1:4000/preview.html
```

This uses mock data (not live API) to test UI rendering.

## Customization After Deployment

### Change Card Title
Edit: `training_hours/i18n/i18n.properties` & `i18n_en.properties`
```
CARD_TITLE=Your New Title
```

### Change Chart Colors
Edit: `training_hours/manifest.json` → Line with `colorPalette`
```json
"colorPalette": ["#NEW_COLOR1", "#NEW_COLOR2"]
```

### Map Different API Fields
If API returns different field names:
1. Edit `training_hours/manifest.json`
2. Update `measures` section with new field names
3. Rebuild and redeploy

## Troubleshooting

**Card not visible in Work Zone?**
- Verify role has been assigned to your user's business catalog
- Check Work Zone admin logs for deployment errors

**No data displayed in chart?**
- Verify API endpoint is accessible from your network
- Check browser console for network errors
- Confirm user has proper BTP authentication

**Wrong language displayed?**
- i18n files should be processed during build
- Check build output includes language files

## Support Resources

- **SAP UI5 Cards**: https://ui5.sap.com/test-resources/sap/ui/integration/demokit/cardExplorer/
- **BTP Documentation**: https://help.sap.com/docs/BTP
- **Work Zone Admin Guide**: Check your BTP portal's Help section
