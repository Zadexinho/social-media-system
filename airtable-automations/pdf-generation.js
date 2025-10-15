// COMPLETE VERSION:
const webhookUrl = 'https://n8n.noesisautomation.com/webhook-test/pdf_dev';
const tableName = 'MAIN';
const currentTable = base.getTable(tableName);
const query = await currentTable.selectRecordsAsync();

const clientRecords = {};

for (const record of query.records) {
    const clientCell = record.getCellValue('Client');
    const clientName = clientCell?.name || String(clientCell);
    
    if (!clientName) continue;
    
    // Check if Aksiyon = 'PDF'
    const aksiyonCell = record.getCellValue('Aksiyon');
    let needsPDF = false;
    
    if (aksiyonCell) {
        if (Array.isArray(aksiyonCell)) {
            needsPDF = aksiyonCell.some(item => item.name === 'PDF');
        } else if (aksiyonCell.name) {
            needsPDF = aksiyonCell.name === 'PDF';
        } else {
            needsPDF = String(aksiyonCell) === 'PDF';
        }
    }
    
    if (needsPDF) {
        if (!clientRecords[clientName]) {
            clientRecords[clientName] = [];
        }
        
        const recordData = { id: record.id, fields: {} };
        for (const field of currentTable.fields) {
            recordData.fields[field.name] = record.getCellValue(field.name);
        }
        clientRecords[clientName].push(recordData);
    }
}

// Send to n8n
for (const [clientName, records] of Object.entries(clientRecords)) {
    if (records.length === 0) continue;
    
    const payload = {
        client_name: clientName,
        table_name: tableName,
        button_type: 'PDF_GENERATE',
        timestamp: new Date().toISOString(),
        records: records
    };
    
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    
    console.log(`✅ Sent ${records.length} records for ${clientName}`);
}