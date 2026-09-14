import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ship, Anchor, ArrowRight, Shield, BarChart3, CloudCog, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { RoleSelector } from '../components/auth/RoleSelector';
import { User, UserRole } from '../types/auth';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsDemo, loginWithGoogle, confirmRoleSelection } = useAuth();
  const { scrollY } = useScroll();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity1 = useTransform(scrollY, [0, 500], [1, 0]);

  const getRedirectPath = (role: UserRole) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login') {
      if (role === 'admin' && !from.startsWith('/shipping')) return from;
      if (role === 'ship-agent' && from.startsWith('/shipping')) return from;
    }
    return role === 'admin' ? '/dashboard' : '/shipping/dashboard';
  };

  const handleDemoLogin = (role: UserRole) => {
    const user = loginAsDemo(role);
    navigate(getRedirectPath(user.role), { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.needsRoleSelection && result.tempUser) {
        setPendingGoogleUser(result.tempUser);
        setShowRoleSelector(true);
      } else {
        const storedRole = localStorage.getItem('portpulse_user_role') as UserRole || 'admin';
        navigate(getRedirectPath(storedRole), { replace: true });
      }
    } catch (e) {
      console.error('Google sign in error:', e);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRoleSelected = (role: UserRole) => {
    const confirmed = confirmRoleSelection(role, pendingGoogleUser);
    setShowRoleSelector(false);
    navigate(getRedirectPath(confirmed.role), { replace: true });
  };

  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-text-main selection:bg-brand-teal selection:text-white">
      
      {/* 1. HERO SECTION (Split Layout) */}
      <section className="relative min-h-screen flex flex-col lg:flex-row bg-black">
        
        {/* Left Half: Black side with content & login */}
        <div className="w-full lg:w-1/2 flex flex-col z-20 min-h-screen p-6 lg:p-12 xl:p-16 relative">
          
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-teal text-white shadow-subtle">
                <Ship className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                PortPilot
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300 tracking-wide">System Online</span>
            </div>
          </header>

          {/* Main Content & Login Block */}
          <div className="flex-1 flex flex-col justify-center my-12 w-full max-w-lg mx-auto space-y-12">
            
            {/* Hero Text */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4 text-center lg:text-left"
            >
              <motion.div variants={fadeUpVariants}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-brand-teal text-xs font-semibold uppercase tracking-wider mb-2">
                  Enterprise Port Management
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Navigate the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal to-brand-blue">
                    future of shipping.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed mt-4">
                  PortPilot is the AI-driven operating system for modern maritime terminals. Eliminate congestion, optimize berth allocations, and track turnaround times in real-time.
                </p>
              </motion.div>
            </motion.div>

            {/* Login Card */}
            <motion.div 
              id="login-panel"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
            >
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-teal to-brand-blue" />
                
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Select your designated portal to continue.</p>
                  </div>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button 
                      onClick={() => setIsLoginMode(true)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${isLoginMode ? 'bg-slate-800 text-brand-teal' : 'text-slate-500 hover:text-white'}`}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setIsLoginMode(false)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${!isLoginMode ? 'bg-slate-800 text-brand-teal' : 'text-slate-500 hover:text-white'}`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full p-4 rounded-xl border border-slate-800 hover:border-brand-teal bg-slate-950 hover:bg-slate-900 transition-all group flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 text-brand-teal flex items-center justify-center shrink-0 group-hover:bg-brand-teal group-hover:text-white transition-colors">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-brand-teal transition-colors text-sm sm:text-base">
                          Port Admin Login
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">
                          Full terminal & AI control
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-teal transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => handleDemoLogin('ship-agent')}
                    className="w-full p-4 rounded-xl border border-slate-800 hover:border-brand-blue bg-slate-950 hover:bg-slate-900 transition-all group flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 text-brand-blue flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        <Anchor className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-brand-blue transition-colors text-sm sm:text-base">
                          Ship Agent Login
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">
                          Schedules & berth requests
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-blue transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                      or
                    </span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <div className="opacity-90 hover:opacity-100 transition-opacity">
                    <GoogleSignInButton
                      onClick={handleGoogleSignIn}
                      isLoading={isGoogleLoading}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Half: Video Section (High Intensity) */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen relative overflow-hidden bg-black">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center scale-[1.15]"
            src="/generate_a_video_for_a_port_ma.mp4"
          />
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-white border-y border-border-subtle relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border-subtle">
            <div className="text-center px-4">
              <div className="text-4xl font-extrabold text-text-main">40%</div>
              <div className="text-sm font-medium text-text-muted mt-2 uppercase tracking-wide">Wait Time Reduction</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-extrabold text-text-main">10K+</div>
              <div className="text-sm font-medium text-text-muted mt-2 uppercase tracking-wide">Vessels Managed</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-extrabold text-text-main">99.9%</div>
              <div className="text-sm font-medium text-text-muted mt-2 uppercase tracking-wide">System Uptime</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl font-extrabold text-text-main">$2M+</div>
              <div className="text-sm font-medium text-text-muted mt-2 uppercase tracking-wide">Demurrage Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-main tracking-tight">Intelligence at every dock.</h2>
            <p className="text-text-muted mt-4 text-lg">PortPilot replaces whiteboards and spreadsheets with predictive AI, giving port authorities complete visibility over their operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl border border-border-subtle shadow-subtle hover:shadow-elevated transition-all"
            >
              <div className="w-14 h-14 bg-teal-50 text-brand-teal rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">Predictive Forecasting</h3>
              <p className="text-text-muted leading-relaxed mb-6">
                Our machine learning models predict berth congestion up to 72 hours in advance, allowing you to intercept bottlenecks before they happen.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-text-main"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> 72-hour horizon</li>
                <li className="flex items-center gap-2 text-sm font-medium text-text-main"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Bottleneck driver analysis</li>
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl border border-border-subtle shadow-subtle hover:shadow-elevated transition-all"
            >
              <div className="w-14 h-14 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center mb-6">
                <CloudCog className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">What-If Simulator</h3>
              <p className="text-text-muted leading-relaxed mb-6">
                Simulate disaster scenarios like crane failures or extreme weather. The AI automatically generates robust recovery plans to minimize impact.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-text-main"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Instant impact projection</li>
                <li className="flex items-center gap-2 text-sm font-medium text-text-main"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Autonomous recovery plans</li>
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-2xl border border-border-subtle shadow-subtle hover:shadow-elevated transition-all"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Ship className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">AI Optimizer</h3>
              <p className="text-text-muted leading-relaxed mb-6">
                Stop guessing berth allocations. The OR-Tools optimizer instantly calculates the perfect configuration of cranes and berths to reduce wait times.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-medium text-text-main"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demurrage cost savings</li>
                <li className="flex items-center gap-2 text-sm font-medium text-text-main"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dynamic crane reallocation</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-white border-t border-border-subtle py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-text-muted" />
            <span className="font-bold text-text-main tracking-tight">PortPilot</span>
          </div>
          <div className="text-sm text-text-muted font-medium">
            &copy; {new Date().getFullYear()} PortPilot Systems. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-text-muted">
            <a href="#" className="hover:text-brand-teal transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-teal transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-teal transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Role Selection Modal for Google Sign-in */}
      {showRoleSelector && (
        <RoleSelector
          onSelectRole={handleRoleSelected}
          userName={pendingGoogleUser?.name}
        />
      )}
    </div>
  );
};
