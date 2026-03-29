const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxWYpcJ-_6Vy6rqyyEqpV9zrSEyZAfbKT8ptCS8YuFF630CZBJv3aioIW52VgFAp-Au/exec';

export async function fetchSheetsTimestamps() {
  try {
    const res = await fetch(SHEETS_URL);
    const json = await res.json();
    return new Set((json.timestamps || []).map(String));
  } catch {
    return null;
  }
}

export async function syncToSheets(solveData) {
  try {
    const res = await fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(solveData) });
    const json = await res.json();
    return json.status === 'success' ? 'success' : 'error';
  } catch {
    return 'error';
  }
}

export async function deleteFromSheets(timestamp) {
  if (!timestamp) return 'idle';
  try {
    const res = await fetch(SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', timestamp }),
    });
    const json = await res.json();
    return json.status === 'success' ? 'success' : 'error';
  } catch {
    return 'error';
  }
}

export async function updatePenaltyOnSheets(timestamp, penalty) {
  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'updatePenalty', timestamp, penalty }),
    });
  } catch {
    // silent fail
  }
}

export async function pushSolvesToSheets(solves) {
  try {
    const res = await fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(solves) });
    const json = await res.json();
    return json.status === 'success' ? 'success' : 'error';
  } catch {
    return 'error';
  }
}
