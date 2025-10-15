// 🚀 AIRTABLE TEXT PROCESSING AUTOMATION - V5 (Dynamic)
// Sends client_name dynamically, no hardcoded mapping

const webhookUrl = 'https://n8n.noesisautomation.com/webhook-test/text-proofreading_dev';
const tableName = 'MAIN';
const currentTable = base.getTable(tableName);
const query = await currentTable.selectRecordsAsync();

const clientRecords = {};

for (const record of query.records) {
    const clientCell = record.getCellValue('Client');
    const clientName = clientCell?.name || String(clientCell);
    
    if (!clientName) continue;
    
    // Check if needs text editing (Gönderi Durumu = "Düzeltme Gerekli" or similar)
    const gonderiMetni = record.getCellValue('Gönderi Metni');
    const hasText = gonderiMetni && String(gonderiMetni).trim().length > 0;
    
    if (hasText) {
        if (!clientRecords[clientName]) {
            clientRecords[clientName] = {
                withText: [],
                withoutText: []
            };
        }
        
        const recordData = { id: record.id, fields: {} };
        for (const field of currentTable.fields) {
            recordData.fields[field.name] = record.getCellValue(field.name);
        }
        clientRecords[clientName].withText.push(recordData);
    }
}

// Send to n8n
let totalProcessed = 0;

for (const [clientName, records] of Object.entries(clientRecords)) {
    if (records.withText.length === 0) continue;
    
    const payload = {
        client_name: clientName,  // ✅ Dynamic
        table_name: tableName,
        button_type: 'TEXT_EDIT',
        timestamp: new Date().toISOString(),
        records: records.withText,
        emptyTextRecordIds: records.withoutText.map(r => r.id)
    };
    
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });
    
    console.log(`✅ Sent ${records.withText.length} records for ${clientName}`);
    totalProcessed += records.withText.length;
}

console.log(`📊 Total: ${totalProcessed} texts sent for proofreading`);