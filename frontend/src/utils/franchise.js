// Makes any franchise-partner record safe to render. Only name + mobile
// number(s) are used. Old records (single `phone`, areas / PIN codes) still
// load fine - the extra fields are simply ignored. Never throws on missing fields.
export const normalizeCard = (card = {}) => {
  const persons = (Array.isArray(card.persons) ? card.persons : []).map((p) => {
    const phones = Array.isArray(p?.phones) && p.phones.length
      ? p.phones
      : (p?.phone ? [p.phone] : [])
    return { name: p?.name || '', phones }
  })
  return { _id: card._id, state: card.state, order: card.order, createdAt: card.createdAt, persons }
}

export const normalizeCards = (list) =>
  (Array.isArray(list) ? list : []).map(normalizeCard)