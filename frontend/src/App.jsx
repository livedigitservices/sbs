
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/admin/AdminLayout'
import AdminRoute from './components/admin/AdminRoute'
import AssociateLayout from './components/associate/AssociateLayout'
import AssociateRoute from './components/associate/AssociateRoute'

import Home from './pages/public/Home'
import JobsLanding from './pages/public/JobsLanding'
import Jobs from './pages/public/Jobs'
import OnlineDegrees from './pages/public/OnlineDegrees'
import AgriInvestments from './pages/public/AgriInvestments'
import Loans from './pages/public/Loans'
import PhdAdmissions from './pages/public/PhdAdmissions'
import MoreServices from './pages/public/MoreServices'
import Contact from './pages/public/Contact'
import AssociateResources from './pages/public/AssociateResources'

import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminResources from './pages/admin/AdminResources'
import AdminQRCode from './pages/admin/AdminQRCode'
import AdminSettings from './pages/admin/AdminSettings'
import StudyAbroad from './pages/public/StudyAbroad'
import HotelManagementIndia from './pages/public/HotelManagementIndia'
import HotelManagementMauritius from './pages/public/HotelManagementMauritius'
import AdminContacts from './pages/admin/AdminContacts'
import AdminFranchisePartners from './pages/admin/AdminFranchisePartners'
import AdminAssociates from './pages/admin/AdminAssociates'

import AssociateLogin from './pages/associate/AssociateLogin'
import AssociateRegister from './pages/associate/AssociateRegister'
import AssociateLeads from './pages/associate/AssociateLeads'
import TradingCourse from './pages/public/TradingCourse'
import FastTrackDegrees from './pages/public/FastTrackDegrees'
import ExtraIncome from './pages/public/ExtraIncome'


import Visas from './pages/public/Visas'
import Freelance from './pages/public/Freelance'
import AdminVisaPosters from './pages/admin/AdminVisaPosters'
import AdminFreelancePosters from './pages/admin/AdminFreelancePosters'
import Tutors from './pages/public/Tutors'
import AdminTutors from './pages/admin/AdminTutors'


export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsLanding />} />
        <Route path="/jobs/:type" element={<Jobs />} />
        <Route path="/online-degrees" element={<OnlineDegrees />} />
        <Route path="/agri-investments" element={<AgriInvestments />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/phd-admissions" element={<PhdAdmissions />} />
        <Route path="/more-services" element={<MoreServices />} />
        <Route path="/study-abroad" element={<StudyAbroad />} />
        <Route path="/hotel-management/india" element={<HotelManagementIndia />} />
        <Route path="/hotel-management/mauritius" element={<HotelManagementMauritius />} />
        <Route path="/associate-resources" element={<AssociateResources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/associate/login" element={<AssociateLogin />} />
        <Route path="/associate/register" element={<AssociateRegister />} />
        <Route path="/trading-course" element={<TradingCourse />} />
        <Route path="/fast-track-degrees" element={<FastTrackDegrees />} />
        <Route path="/extra-income" element={<ExtraIncome />} />
        <Route path="/visas" element={<Visas />} />
        <Route path="/freelance" element={<Freelance />} />
        <Route path="/tutors" element={<Tutors />} />

        {/* Associate protected — same navbar/footer chrome as the rest of the public site */}
        <Route path="/associate" element={<AssociateRoute><AssociateLayout /></AssociateRoute>}>
          <Route path="leads" element={<AssociateLeads />} />
        </Route>
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin protected */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="resources" element={<AdminResources />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="franchise-partners" element={<AdminFranchisePartners />} />
        <Route path="associates" element={<AdminAssociates />} />
        <Route path="qr" element={<AdminQRCode />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="tutors" element={<AdminTutors />} />
        <Route path="visa-posters" element={<AdminVisaPosters />} />
        <Route path="freelance-posters" element={<AdminFreelancePosters />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}