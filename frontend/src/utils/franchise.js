// Makes any franchise-partner record safe to render, whether it comes from the
// new API (persons[].phones / persons[].areas) or from the old API
// (flat `areas` strings + persons[].phone). Never throws on missing fields.
const splitLegacyArea = (raw) => {
  const v = String(raw ?? '').trim()
  const m = v.match(/^(\d{6})\s*[-,]?\s*(.*)$/) // "508001 Nalgonda" -> PIN + area
  return m ? { area: m[2].trim(), pincode: m[1] } : { area: v, pincode: '' }
}

export const normalizeCard = (card = {}) => {
  const legacyAreas = (Array.isArray(card.areas) ? card.areas : []).map(splitLegacyArea)
  const persons = (Array.isArray(card.persons) ? card.persons : []).map((p, i) => {
    const phones = Array.isArray(p?.phones) && p.phones.length
      ? p.phones
      : (p?.phone ? [p.phone] : [])
    const areas = Array.isArray(p?.areas) && p.areas.length
      ? p.areas
      : (i === 0 ? legacyAreas : [])
    return { name: p?.name || '', phones, areas }
  })
  return { ...card, persons }
}

export const normalizeCards = (list) =>
  (Array.isArray(list) ? list : []).map(normalizeCard)