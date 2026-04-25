import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailIcon, LockIcon, UserIcon, ArrowLeftIcon, GraduationCapIcon, StoreIcon, ShieldCheckIcon, } from 'lucide-react';

export function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [selectedRole, setSelectedRole] = useState('student');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const validateForm = () => {
        if (!isLogin && fullName.trim().length < 2) {
            setErrorMsg("Full name must be at least 2 characters long.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg("Please enter a valid email address.");
            return false;
        }
        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return false;
        }
        if (!isLogin && password !== confirmPassword) {
            setErrorMsg("Passwords do not match!");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!validateForm()) {
            return;
        }

        const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
        const payload = isLogin 
            ? { email, password }
            : { fullName, email, password, role: selectedRole };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMsg(data.message || 'Authentication failed');
                return;
            }

            if (data.pendingActivation) {
                setSuccessMsg(data.message);
                setIsLogin(true); // Switch to login tab so they can login later
                setFullName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user?.role === 'vendor') {
                navigate('/vendor-dashboard');
            } else if (data.user?.role === 'admin'){
                navigate('/admin-dashboard');
            }else {
                navigate('/');
            }

        } catch (error) {
            setErrorMsg("Network error. Please try again later.");
        }
    };
    const roles = [
        {
            id: 'student',
            label: 'Student',
            icon: GraduationCapIcon,
        },
        {
            id: 'vendor',
            label: 'Vendor',
            icon: StoreIcon,
        },
        {
            id: 'admin',
            label: 'Admin',
            icon: ShieldCheckIcon,
        },
    ];
    return (<div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-200/30 blur-3xl pointer-events-none"/>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-warm-200/30 blur-3xl pointer-events-none"/>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center text-surface-500 hover:text-brand-600 font-medium mb-6 transition-colors">
          <ArrowLeftIcon size={16} className="mr-2"/>
          Back to home
        </Link>

        {/* Card Replacement */}
        <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-elevated border-surface-200/60 backdrop-blur-xl bg-surface-0/90 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-surface-500">
              {isLogin
            ? 'Enter your details to access your account'
            : 'Sign up to start ordering and reserving'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-surface-100 rounded-xl mb-8">
            <button className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-surface-0 text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`} onClick={() => setIsLogin(true)}>
              Log In
            </button>
            <button className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-surface-0 text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`} onClick={() => setIsLogin(false)}>
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (<motion.div initial={{
                opacity: 0,
                height: 0,
            }} animate={{
                opacity: 1,
                height: 'auto',
            }} className="space-y-5">
                {/* Full Name Input Replacement */}
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-surface-700">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                      <UserIcon size={18}/>
                    </div>
                    <input required placeholder="add your name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-surface-0 disabled:opacity-50 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-700">
                    I am a...
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (<button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-surface-200 bg-surface-0 text-surface-600 hover:border-brand-200'}`}>
                          <Icon size={20} className="mb-1.5"/>
                          <span className="text-xs font-medium">
                            {role.label}
                          </span>
                        </button>);
            })}
                  </div>
                </div>
              </motion.div>)}

            {/* Email Address Input Replacement */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-medium text-surface-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                  <MailIcon size={18}/>
                </div>
                <input required type="email" placeholder="example@sliit.lk" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-surface-0 disabled:opacity-50 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400" />
              </div>
            </div>

            <div className="space-y-1">
              {/* Password Input Replacement */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-medium text-surface-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <LockIcon size={18}/>
                  </div>
                  <input required type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-surface-0 disabled:opacity-50 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400" />
                </div>
              </div>
              {isLogin && (<div className="flex justify-end">
                  <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-700">
                    Forgot password?
                  </a>
                </div>)}
              {!isLogin && (
                <div className="w-full flex flex-col gap-1.5 mt-4">
                  <label className="text-sm font-medium text-surface-700">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                      <LockIcon size={18}/>
                    </div>
                    <input required type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-surface-0 disabled:opacity-50 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button Replacement */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="mt-2 w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 focus:ring-brand-500 shadow-soft px-8 py-3.5 text-lg">
              {isLogin ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-0 text-surface-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {/* Google / Apple Button Replacements */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200 px-5 py-2.5 text-sm">
              Google
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200 px-5 py-2.5 text-sm">
              Apple
            </motion.button>
          </div>
        </div>
      </div>
    </div>);
}
