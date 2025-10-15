/**
 * Airtable Automation Script - Posting (Updated for unified table)
 * Inputs: record_id, table_id
 * Now filters by Client column instead of table_id
 */

// Get minimal inputs
const inputConfig = input.config();
const recordId = inputConfig.record_id;
const tableId = inputConfig.table_id;

console.log(`Processing record ${recordId} from table ${tableId}`);

// Get the table and record
const table = base.getTable('MAIN'); // Unified table name
const record = await table.selectRecordAsync(recordId);

if (!record) {
  console.error(`❌ Record ${recordId} not found`);
  return;
}

// Get field values directly from the record
const aksiyon = record.getCellValue('Aksiyon');
const backendStatus = record.getCellValue('Backend Status');
const client = record.getCellValue('Client'); // NEW: Get client column

// Extract names from Single Select objects
let aksiyonName;
if (typeof aksiyon === 'object' && aksiyon !== null) {
  aksiyonName = aksiyon.name;
} else {
  aksiyonName = aksiyon;
}

let backendStatusName;
if (typeof backendStatus === 'object' && backendStatus !== null) {
  backendStatusName = backendStatus.name;
} else {
  backendStatusName = backendStatus;
}

let clientName;
if (typeof client === 'object' && client !== null) {
  clientName = client.name;
} else {
  clientName = client;
}

console.log(`Aksiyon: ${aksiyonName}, Backend Status: ${backendStatusName}, Client: ${clientName}`);

// ============================================================================
// 1. USER PERMISSION CHECK
// ============================================================================

if (aksiyonName !== 'Paylaşıma Hazır') {
  console.log(`❌ Record not ready for sharing. Current status: ${aksiyonName}`);
  return; // Silent exit
}

// ============================================================================
// 2. DUPLICATE EXECUTION PREVENTION
// ============================================================================

if (backendStatusName !== 'Will be shared') {
  console.log(`⚠️ Record already processed. Backend Status: ${backendStatusName}`);
  return; // Prevent duplicate execution
}

// ============================================================================
// 3. CLIENT VALIDATION
// ============================================================================

if (!clientName) {
  console.error(`❌ No client specified for record ${recordId}`);
  return;
}

// ============================================================================
// 4. SEND TO N8N (Updated payload with client info)
// ============================================================================

const webhookUrl = 'https://n8n.noesisautomation.com/webhook-test/posting_dev';
const payload = {
  table_id: tableId,
  record_id: recordId,
  client_name: clientName, // NEW: Include client name
  action: 'posting',
  triggered_by: 'scheduled_automation',
  execution_type: 'scheduled',
  timestamp: new Date().toISOString()
};

try {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    console.log(`✅ Successfully sent record ${recordId} to n8n for client ${clientName}`);
  } else {
    const errorText = await response.text();
    console.error(`❌ Webhook failed:`, response.status, errorText);
  }

} catch (error) {
  console.error(`💥 Network error:`, error);
}