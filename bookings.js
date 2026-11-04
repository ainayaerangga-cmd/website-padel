const L = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  try {
    const { date, type, hour, name, phone, coach } = req.body || {};
    if (!name || !/^[0-9+\s-]{8,16}$/.test(phone || '')) return res.status(400).json({ error: 'Enter your name and a valid phone number.' });
    if (!L.COURTS[type] || !L.HOURS.includes(hour) || !L.validDate(date)) return res.status(400).json({ error: 'Invalid booking details.' });

    const id = 'PD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    const record = JSON.stringify({ id, date, type, hour, name: String(name).slice(0, 80), phone, coach: coach || null });
    for (const court of L.COURTS[type]) {
      if (L.seededTaken(date, court, hour)) continue;
      if (await L.claim(L.keyOf(date, court, hour), record)) {
        const total = L.PRICES[type] + (L.COACHES[coach] || 0);
        return res.status(201).json({ id, date, type, hour, court, total });
      }
    }
    res.status(409).json({ error: 'That hour was just taken. Pick another time.' });
  } catch (e) {
    res.status(500).json({ error: 'Could not save the booking.' });
  }
};
