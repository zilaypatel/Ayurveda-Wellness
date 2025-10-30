import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, PrakritiResult } from '../lib/supabase';
import { UserProfile } from './UserProfile';
import { PrakritiQuiz } from './PrakritiQuiz';
import { DietChart } from './DietChart';
import { DailySchedule } from './DailySchedule';
import { FollowUp } from './FollowUp';
import { AdminDashboard } from './AdminDashboard';
import { Heart, User, Brain, Utensils, Clock, Calendar, Shield, LogOut, Menu, X } from 'lucide-react';

type View = 'home' | 'profile' | 'quiz' | 'diet' | 'schedule' | 'followup' | 'admin';

export function Dashboard() {
  const { user, signOut, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [prakritiResult, setPrakritiResult] = useState<PrakritiResult | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrakritiResult();
    }
  }, [user]);

  const loadPrakritiResult = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('prakriti_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setPrakritiResult(data);
  };

  const handleQuizComplete = () => {
    loadPrakritiResult();
    setCurrentView('diet');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { id: 'home' as View, label: 'Home', icon: Heart },
    { id: 'profile' as View, label: 'Profile', icon: User },
    { id: 'quiz' as View, label: 'Prakriti Quiz', icon: Brain },
    { id: 'diet' as View, label: 'Diet Chart', icon: Utensils },
    { id: 'schedule' as View, label: 'Daily Schedule', icon: Clock },
    { id: 'followup' as View, label: 'Follow-ups', icon: Calendar },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin' as View, label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Ayurveda Wellness</span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 transition-colors ${
                    currentView === item.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to Ayurveda Wellness
              </h1>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Discover your unique Ayurvedic constitution and receive personalized recommendations
                for a balanced, healthy lifestyle.
              </p>

              {prakritiResult ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                    Your Prakriti: {prakritiResult.dominant_dosha.toUpperCase()}
                  </h3>
                  <p className="text-emerald-700 mb-4">
                    You have completed your Prakriti analysis. Explore your personalized diet and
                    schedule recommendations.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setCurrentView('diet')}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                      View Diet Chart
                    </button>
                    <button
                      onClick={() => setCurrentView('schedule')}
                      className="px-6 py-3 bg-white hover:bg-gray-50 text-emerald-600 border border-emerald-600 font-medium rounded-lg transition-colors"
                    >
                      View Daily Schedule
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">
                    Get Started with Your Prakriti Analysis
                  </h3>
                  <p className="text-amber-700 mb-4">
                    Take our comprehensive quiz to discover your Ayurvedic body type and receive
                    personalized wellness recommendations.
                  </p>
                  <button
                    onClick={() => setCurrentView('quiz')}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Take Prakriti Quiz
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <Brain className="w-10 h-10 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Prakriti Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Understand your unique constitution through our detailed questionnaire
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <Utensils className="w-10 h-10 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Personalized Diet</h3>
                  <p className="text-sm text-gray-600">
                    Get customized food recommendations based on your dosha
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <Clock className="w-10 h-10 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Daily Routine</h3>
                  <p className="text-sm text-gray-600">
                    Follow a tailored wellness schedule for optimal balance
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'profile' && <UserProfile />}
        {currentView === 'quiz' && <PrakritiQuiz onComplete={handleQuizComplete} />}
        {currentView === 'diet' && <DietChart />}
        {currentView === 'schedule' && <DailySchedule />}
        {currentView === 'followup' && <FollowUp />}
        {currentView === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Ayurveda Wellness - Embrace holistic health through ancient wisdom
          </p>
        </div>
      </footer>
    </div>
  );
}
