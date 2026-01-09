
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Apartments from "./pages/Apartments";
import ApartmentNew from "./pages/ApartmentNew";
import ApartmentView from "./pages/ApartmentView";
import ApartmentEdit from "./pages/ApartmentEdit";
import Products from "./pages/Products";
import ProductNew from "./pages/ProductNew";
import ProductView from "./pages/ProductView";
import ProductEdit from "./pages/ProductEdit";
import ProductImport from "./pages/ProductImport";
import Orders from "./pages/Orders";
import OrderNew from "./pages/OrderNew";
import OrderView from "./pages/OrderView";
import OrderEdit from "./pages/OrderEdit";
import Deliveries from "./pages/Deliveries";
import Issues from "./pages/Issues";
import IssuesWithAI from "./pages/IssuesWithAI";
import IssueNew from "./pages/IssueNew";
import IssueDetail from "./pages/IssueDetail";
import IssueEdit from "./pages/IssueEdit";
import Payments from "./pages/Payments";
import PaymentNew from "./pages/PaymentNew";
import PaymentDetail from "./pages/PaymentDetail";
import PaymentEdit from "./pages/PaymentEdit";
import Vendors from "./pages/Vendors";
import VendorNew from "./pages/VendorNew";
import VendorView from "./pages/VendorView";
import VendorEdit from "./pages/VendorEdit";
import Users from "./pages/Users";
import Automations from "./pages/Automations";
import Settings from "./pages/Settings";
import BulkEmail from "./pages/BulkEmail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/apartments" element={<ProtectedRoute><Apartments /></ProtectedRoute>} />
          <Route path="/apartments/new" element={<ProtectedRoute><ApartmentNew /></ProtectedRoute>} />
          <Route path="/apartments/:id" element={<ProtectedRoute><ApartmentView /></ProtectedRoute>} />
          <Route path="/apartments/:id/edit" element={<ProtectedRoute><ApartmentEdit /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/products/new" element={<ProtectedRoute><ProductNew /></ProtectedRoute>} />
          <Route path="/products/import" element={<ProtectedRoute><ProductImport /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute><ProductView /></ProtectedRoute>} />
          <Route path="/products/:id/edit" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/new" element={<ProtectedRoute><OrderNew /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderView /></ProtectedRoute>} />
          <Route path="/orders/:id/edit" element={<ProtectedRoute><OrderEdit /></ProtectedRoute>} />
          <Route path="/deliveries" element={<ProtectedRoute><Deliveries /></ProtectedRoute>} />
          <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
          <Route path="/issues/new" element={<ProtectedRoute><IssueNew /></ProtectedRoute>} />
          <Route path="/issues/bulk-email" element={<ProtectedRoute><BulkEmail /></ProtectedRoute>} />
          <Route path="/issues/:issueId" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
          <Route path="/issues/:issueId/edit" element={<ProtectedRoute><IssueEdit /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/payments/new" element={<ProtectedRoute><PaymentNew /></ProtectedRoute>} />
          <Route path="/payments/:id" element={<ProtectedRoute><PaymentDetail /></ProtectedRoute>} />
          <Route path="/payments/:id/edit" element={<ProtectedRoute><PaymentEdit /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
          <Route path="/vendors/new" element={<ProtectedRoute><VendorNew /></ProtectedRoute>} />
          <Route path="/vendors/:id" element={<ProtectedRoute><VendorView /></ProtectedRoute>} />
          <Route path="/vendors/:id/edit" element={<ProtectedRoute><VendorEdit /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
