import React from 'react'
import AdPoster from '../../components/public/AdPoster'

const IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80'

const ITEMS = [
  'B.Tech- CSE AI - ML',
  'B.Tech- Quantum Technology',
  'B.Tech- ECE, Civil, Electrical - All Brands',
  'B.Sc Agriculture - ICAR Accredited',
  'B.P.T Physiotherapy',
  'Paramedical Courses',
  'B.Tech Mining',
  'B. Tech Agriculture',
  'B.Tech BioTechnology',
  'B.Tech Food Technology',
  'B.Tech Cement Technology',
]

export default function OnlineAdmissions() {
  return (
    <AdPoster
      image={IMAGE}
      title="Online Admissions"
      badge="Top Rated Colleges"
      headline={['Medical | Engineering | Pharma | Agriculture', 'Management | Ayush']}
      introTitle="Top Rated Colleges Admissions"
      intro="Find the right college for bright future. We provide admissions in India’s Top Rated University Colleges. We are having 25+ years of experience in guiding students & parents to obtain admissions in reputed institutions."
      listTitle="Get Admissions - We guide you to join in Top Rated College - Top Courses"
      items={ITEMS}
      extraLines={[
        'M.Sc Agriculture . MBA-Agri Business . BBA-Digital Marketing .',
        'BCA- Artificial Intelligence . MBA- All Branches',
      ]}
      boldLine="ALL PG Courses & Ph.D. All Subjects"
      perks={['No Donation', '100% Placements', 'Low Fee', 'Loan Support']}
    />
  )
}