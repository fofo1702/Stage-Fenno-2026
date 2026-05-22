const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

const wb   = XLSX.readFile('Map1.xlsx');
const ws   = wb.Sheets['Analyse HL 2 (2)'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const headers    = rows[5];
const summaryRow = rows[3];

var EXCLUDED = ['Avg', 'Line nr'];
var fieldCols = [];
for (var i = 0; i < headers.length; i++) {
    var s = summaryRow[i];
    if (headers[i] && EXCLUDED.indexOf(headers[i]) === -1 && typeof s === 'number' && s >= 0 && s <= 1) {
        fieldCols.push({ name: headers[i], colIdx: i });
    }
}
console.log('Fields (' + fieldCols.length + '):', fieldCols.map(function(f) { return f.name; }));

// Group rows by filename
var fileRowsMap = {};
for (var r = 6; r < rows.length; r++) {
    var row = rows[r];
    var fileName = row[2];
    if (!fileName || typeof fileName !== 'string') { continue; }
    if (row[3] !== 'extracted') { continue; }
    if (!fileRowsMap.hasOwnProperty(fileName)) { fileRowsMap[fileName] = []; }
    fileRowsMap[fileName].push(row);
}

var fileNames = Object.keys(fileRowsMap).sort();
console.log('Files:', fileNames.length);

// Helper: build field data for a set of rows
function buildFieldData(rowsForFile) {
    return fieldCols.map(function(f) {
        var vals = rowsForFile.map(function(row) {
            var v = row[f.colIdx];
            return typeof v === 'number' ? v : 1;
        });
        var avg = vals.reduce(function(s, v) { return s + v; }, 0) / vals.length;
        return avg;
    });
}

// Build "all files" view: for each field, % of files where avg >= 1, + missingFiles list
var allData = fieldCols.map(function(f, fi) {
    var fileValues = {};
    fileNames.forEach(function(fn) {
        var vals = fileRowsMap[fn].map(function(row) {
            var v = row[f.colIdx];
            return typeof v === 'number' ? v : 1;
        });
        fileValues[fn] = vals.reduce(function(s, v) { return s + v; }, 0) / vals.length;
    });
    var pct = (fileNames.filter(function(fn) { return fileValues[fn] >= 1; }).length / fileNames.length);
    var missingFiles = fileNames.filter(function(fn) { return fileValues[fn] < 1; });
    return { category: f.name, percentage: pct, missingFiles: missingFiles };
});

// Write main data.json (all files summary)
fs.writeFileSync('data.json', JSON.stringify(allData, null, 2));
console.log('Written data.json');

// Create filedata/ directory
var filedir = path.join(__dirname, 'filedata');
if (!fs.existsSync(filedir)) { fs.mkdirSync(filedir); }

// Write filedata/__all__.json = same as allData
fs.writeFileSync(path.join(filedir, '__all__.json'), JSON.stringify(allData, null, 2));

// Write filedata/{index}.json for each file — binary 0 or 100 per field
fileNames.forEach(function(fn, idx) {
    var entry = fieldCols.map(function(f) {
        var vals = fileRowsMap[fn].map(function(row) {
            var v = row[f.colIdx];
            return typeof v === 'number' ? v : 1;
        });
        var avg = vals.reduce(function(s, v) { return s + v; }, 0) / vals.length;
        return { category: f.name, percentage: avg >= 1 ? 1.0 : 0.0, missingFiles: [] };
    });
    fs.writeFileSync(path.join(filedir, idx + '.json'), JSON.stringify(entry, null, 2));
});
console.log('Written filedata/ (' + (fileNames.length + 1) + ' files)');

// Write filteritems.json with numeric keys
var filterItems = [{ key: '__all__', title: 'All Files (' + fileNames.length + ')' }];
fileNames.forEach(function(fn, idx) {
    filterItems.push({ key: String(idx), title: fn });
});
fs.writeFileSync('filteritems.json', JSON.stringify({ items: filterItems }, null, 2));
console.log('Written filteritems.json (' + filterItems.length + ' items)');

