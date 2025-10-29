

import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages inside the patient dashboard
import Dashboard from "./Dashboard";
import MedicalRecord from "./MedicalRecord";
import Settings from "./Settings";
import AppointmentList from "./AppointmentList";
import Insurance from "./Insurance";
import Billing from "./Billing";
import NearbyPharmacies from "./NearbyPharmacy"
import PatientNotifications from './Notifications';
import PaymentForm from './PaymentForm';
import LabHome from './LabHome';
import PrescriptionUpload from "./PrescriptionUpload";
import TestDetail from './TestDetail';
import CartPage from './CartPage';
import AvailableLabs from "./AvailableLab";
import LabBooking from "./LabBooking";
import MultiStepForm from "../../../../components/BookApp";
import PaymentLab from "./PaymentLab";
import TrackAppointment from "./TrackApp";
import Emergency from "./Emergency/EmergencyForm";
import EmergencySearch from './Emergency/EmergencySearch';
 import BookLab from './BookLab';
 import DoctorList from '../../../../components/DoctorList';
 import ProductCard from "./ProductCard";
import CheckOut from "./CheckOut";
import OrderConfirmation from "./OrderConfirmation";
import  AllOrdersPage  from "./AllOrdersPage";
import ProductDetail from './ProductDetail';
import OrderTracking from "./OrderTracking";
import CartProduct from "./CartProduct";
import DocsReader from "../../../../components/DocsReader";
import SecondOpinion from "./SecondOpinion";
import MedicalRecordDetails from "./MedicalRecordDetails";
import Help from "./Help";

const PdashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="medical-records" element={<MedicalRecord/>} />
      <Route path="medical-record-details" element={<MedicalRecordDetails/>} />
      <Route path="settings" element={<Settings />} />
      <Route path="app" element={<AppointmentList />} />
      <Route path="book-appointment" element={<MultiStepForm />} />
      <Route path="/document-reader" element={<DocsReader />} />
      {/* Optional extra routes */}
      <Route path="insurance" element={<Insurance/>} />
      <Route path="billing" element={<Billing/>} />
      <Route path="notifications" element={<PatientNotifications/>} />
      <Route path="/payment" element={<PaymentForm />} />
      <Route path="emergency" element={<h1>Emergency Info</h1>} />
                <Route path="/ambulancesearch" element={<EmergencySearch />} />

      <Route path="lab-tests" element={<LabHome />} />
      <Route path="lab-tests/test/:id" element={<TestDetail />} />
      <Route path="package-details/:id" element={<TestDetail />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="available-labs"element={<AvailableLabs />}/>
      <Route path="lab-booking" element={<LabBooking />} />
      <Route path="prescription-upload" element={<PrescriptionUpload />} />
      <Route path="book-app" element={<BookLab />} />
      <Route path="payment1" element={<PaymentLab />} />
      <Route path="track-appointment/:bookingId" element={<TrackAppointment />} />
      <Route path="/alldoctors" element={<DoctorList />} />
   <Route path="help" element={<Help />} />

<Route path="/shopping" element={<ProductCard />} />
      <Route path="/cartproduct" element={<CartProduct />} />
      <Route path="/checkout" element={<CheckOut />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
      <Route path="/track-order/:orderId" element={<OrderTracking />} />
            <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/orders" element={<AllOrdersPage />} />
      <Route path="ambulance" element={<Emergency/>} />
      <Route path="pharmacy" element={<NearbyPharmacies/>} />
      <Route path="second-opinion" element={<SecondOpinion/>} />

      {/* Fallback route */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      
    </Routes>
  );
};

export default PdashboardRoutes;
