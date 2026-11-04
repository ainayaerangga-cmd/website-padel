const L = require('./_lib');

module.exports = async (req, res) => {
  try {
    const { date, type } = req.query;
    if (!L.validDate(date) || !L.COURTS[type]) return res.status(400).json({ error: 'Provide date (YYYY-MM-DD) and type (indoor|outdoor).' });
    const courts = L.COURTS[type];
    const pairs = L.HOURS.flatMap((h) => courts.map((c) => [h, c]));
    const taken = await L.areTaken(pairs.map(([h, c]) => L.keyOf(date, c, h)));
    const slots = L.HOURS.map((h) => ({
      hour: h,
      free: pairs.filter(([hh, c], i) => hh === h && !L.seededTaken(date, c, h) && !taken[i]).length
    }));
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ price: L.PRICES[type], persistent: L.persistent, slots });
  } catch (e) {
    res.status(500).json({ error: 'Could not load availability.' });
  }
};
