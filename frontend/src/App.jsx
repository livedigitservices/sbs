
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/admin/AdminLayout'
import AdminRoute from './components/admin/AdminRoute'
import AssociateLayout from './components/associate/AssociateLayout'
import AssociateRoute from './components/associate/AssociateRoute'

import Home from './pages/public/Home'
import OnlineDegrees from './pages/public/OnlineDegrees'
import PhdAdmissions from './pages/public/PhdAdmissions'
import Contact from './pages/public/Contact'
import AssociateResources from './pages/public/AssociateResources'

import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminResources from './pages/admin/AdminResources'
import AdminQRCode from './pages/admin/AdminQRCode'
import AdminSettings from './pages/admin/AdminSettings'
import AdminContacts from './pages/admin/AdminContacts'
import AdminFranchisePartners from './pages/admin/AdminFranchisePartners'
import AdminAssociates from './pages/admin/AdminAssociates'
import AssociateLogin from './pages/associate/AssociateLogin'
import AssociateRegister from './pages/associate/AssociateRegister'
import AssociateLeads from './pages/associate/AssociateLeads'
import AdminFreelancePosters from './pages/admin/AdminFreelancePosters'
import Tutors from './pages/public/Tutors'
import AdminTutors from './pages/admin/AdminTutors'


export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/online-degrees" element={<OnlineDegrees />} />
        <Route path="/phd-admissions" element={<PhdAdmissions />} />
        <Route path="/associate-resources" element={<AssociateResources />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/associate/login" element={<AssociateLogin />} />
        <Route path="/associate/register" element={<AssociateRegister />} />
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
        <Route path="freelance-posters" element={<AdminFreelancePosters />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}