// Makes any franchise-partner record safe to render. Uses name, location,
// services/business and mobile number(s). Old records (single `phone`, no
// location/services) still load fine - missing fields become empty strings.
// Never throws on missing fields.
export const normalizeCard = (card = {}) => {
  const persons = (Array.isArray(card.persons) ? card.persons : []).map((p) => {
    const phones = Array.isArray(p?.phones) && p.phones.length
      ? p.phones
      : (p?.phone ? [p.phone] : [])
    return {
      name: p?.name || '',
      location: p?.location || '',
      services: p?.services || '',
      phones,
    }
  })
  return { _id: card._id, state: card.state, order: card.order, createdAt: card.createdAt, persons }
}

export const normalizeCards = (list) =>
  (Array.isArray(list) ? list : []).map(normalizeCard)