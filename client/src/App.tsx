import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Droplet, Heart, Search, Home } from 'lucide-react';
import DonorForm from './pages/DonorForm';
import ReceiverForm from './pages/ReceiverForm';
import RequestStatus from './pages/RequestStatus';

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <Droplet className="w-16 h-16 text-red-600 fill-current" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Blood Connect</h1>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        A deterministic matching system to connect life-savers with those in need. Simple, fast, and reliable.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/register-donor"
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
        >
          <Heart className="w-5 h-5" />
          Become a Donor
        </Link>
        <Link
          to="/request-blood"
          className="flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
        >
          <Search className="w-5 h-5" />
          Request Blood
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link to="/" className="flex items-center gap-2">
                <Droplet className="w-8 h-8 text-red-600" />
                <span className="text-xl font-bold text-gray-900">BloodConnect</span>
              </Link>
              <div className="flex gap-4">
                <Link to="/" className="text-gray-500 hover:text-red-600 p-2 rounded-lg transition-colors">
                  <Home className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register-donor" element={<DonorForm />} />
            <Route path="/request-blood" element={<ReceiverForm />} />
            <Route path="/request/:id" element={<RequestStatus />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} BloodConnect Matching System. Built with Supabase.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
