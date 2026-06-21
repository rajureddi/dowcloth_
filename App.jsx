import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Styles
import './src/styles/index.css';
import './src/styles/animations.css';

// Context Providers
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ToastProvider } from './src/context/ToastContext';

// Layout Components
import Header from './src/components/Header';
import Footer from './src/components/Footer';
import CartDrawer from './src/components/CartDrawer';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import VirtualTryOnScreen from './src/screens/VirtualTryOnScreen';
import FashionAssistantScreen from './src/screens/FashionAssistantScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import SkinToneAnalysisScreen from './src/screens/SkinToneAnalysisScreen';
import ImageEnhancementScreen from './src/screens/ImageEnhancementScreen';
import AIStyleRecommendationScreen from './src/screens/AIStyleRecommendationScreen';

// Pages that suppress Header/Footer
const BARE_ROUTES = ['/checkout', '/order-tracking'];

function AppShell() {
  const loc = useLocation();
  const isBare = BARE_ROUTES.some(r => loc.pathname.startsWith(r));

  return (
    <>
      {!isBare && <Header />}
      <CartDrawer />
      <Routes>
        <Route path="/"                      element={<HomeScreen />} />
        <Route path="/category/:name"        element={<CategoriesScreen />} />
        <Route path="/product/:id"           element={<ProductDetailScreen />} />
        <Route path="/wishlist"              element={<WishlistScreen />} />
        <Route path="/checkout"             element={<CheckoutScreen />} />
        <Route path="/virtual-vto/:id"      element={<VirtualTryOnScreen />} />
        <Route path="/fashion-assistant"    element={<FashionAssistantScreen />} />
        <Route path="/order-tracking"       element={<OrderTrackingScreen />} />
        <Route path="/skin-tone-analysis"   element={<SkinToneAnalysisScreen />} />
        <Route path="/image-enhancement"    element={<ImageEnhancementScreen />} />
        <Route path="/ai-style-finder"      element={<AIStyleRecommendationScreen />} />
        {/* Redirect unknown routes to home */}
        <Route path="*"                     element={<HomeScreen />} />
      </Routes>
      {!isBare && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}
