import React from 'react'
import AdPoster from '../../components/public/AdPoster'

const IMAGE =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80'

const ITEMS = [
  'Bulk SMS', 'WhatsApp Services', 'AI Solutions', 'Ionizers', 'Agriculture & Farming',
  'Digital Marketing', 'Website Services', 'Solar Products', 'LED Products',
  'Education', 'Import & Export', 'And More...',
]

export default function OnlineReseller() {
  return (
    <AdPoster
      image={IMAGE}
      title="Online Reseller"
      badge="Earn Online"
      headline={['BULK SMS | WHATSAPP | AI', 'IONIZERS | AGRI | MANY']}
      introTitle="EARN ONLINE. Smarter. Accessible"
      intro="Earn online from anywhere with just your smartphone. Access flexible reselling opportunities, personalised guidance, industry connections, and structured mentoring to build your online business while balancing work and life"
      listTitle="Be Online Reseller"
      items={ITEMS}
    />
  )
}