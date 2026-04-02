import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailIcon, KeyIcon, CheckCircleIcon, MapPinIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export function TableCheckInPage() {
    const { location, tableId } = useParams();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [reservationCode, setReservationCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [reservationDetails, setReservationDetails] = useState(null);

    const formatLocationName = (id) => {
        if (!id) return '';
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/reservations/verify-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    reservationCode,
                    tableId,
                    location: formatLocationName(location)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            setReservationDetails(data);
            setStep(2);

        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAccept = async () => {
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            const response = await fetch('/api/reservations/accept-checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationCode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Check-in failed');
            }

            setStep(3);
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-200/30 blur-3xl pointer-events-none"/>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-warm-200/30 blur-3xl pointer-events-none"/>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-surface-900 mb-2">Table Check-In</h1>
                    <p className="text-surface-500 flex items-center justify-center gap-2 font-medium">
                        <MapPinIcon size={16} className="text-brand-500" />
                        {formatLocationName(location)} - Table {tableId}
                    </p>
                </div>

                {step === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-0 rounded-2xl overflow-hidden shadow-elevated border-surface-200/60 p-8"
                    >
                        <p className="text-surface-600 mb-6 text-center text-sm">
                            Please verify your reservation to unlock this table.
                        </p>

                        {errorMsg && (
                            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-5">
                            <div className="w-full flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-surface-700">Registered Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                                        <MailIcon size={18} />
                                    </div>
                                    <input 
                                        required 
                                        type="email" 
                                        placeholder="example@sliit.lk" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full pl-11 pr-4 py-3 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-surface-0 border-surface-200 focus:ring-brand-400 focus:border-brand-400"
                                    />
                                </div>
                            </div>

                            <div className="w-full flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-surface-700">Reservation Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                                        <KeyIcon size={18} />
                                    </div>
                                    <input 
                                        required 
                                        type="text" 
                                        placeholder="e.g. AB12CD" 
                                        value={reservationCode} 
                                        onChange={(e) => setReservationCode(e.target.value.toUpperCase())} 
                                        className="w-full pl-11 pr-4 py-3 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-surface-0 border-surface-200 focus:ring-brand-400 focus:border-brand-400 uppercase tracking-widest font-medium"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting || !email || !reservationCode}
                                className="mt-4 w-full inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 shadow-soft px-8 py-3.5 text-lg"
                            >
                                {isSubmitting ? 'Verifying...' : 'Check Reservation'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && reservationDetails && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface-0 rounded-2xl overflow-hidden shadow-elevated border-brand-200 p-8 text-center"
                    >
                        <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-surface-900 mb-1">Reservation Found!</h2>
                        <p className="text-surface-500 text-sm mb-6">You are right on time.</p>

                        <div className="bg-surface-50 rounded-xl p-4 border border-surface-200 text-left mb-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-surface-500 text-sm flex items-center gap-2"><ClockIcon size={16}/> Time</span>
                                <span className="font-semibold text-surface-900">{reservationDetails.date} at {reservationDetails.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-surface-500 text-sm flex items-center gap-2"><UsersIcon size={16}/> Seats</span>
                                <span className="font-semibold text-surface-900">{reservationDetails.seats} people</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                                <span className="text-surface-500 text-sm">Reserved under</span>
                                <span className="font-semibold text-surface-900">{reservationDetails.userId.fullName || 'Guest'}</span>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <button 
                            onClick={handleAccept}
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-900 text-white hover:bg-black shadow-lg px-8 py-3.5 text-lg"
                        >
                            {isSubmitting ? 'Checking in...' : 'Accept Reservation Table'}
                        </button>
                        <button 
                            onClick={() => setStep(1)}
                            disabled={isSubmitting}
                            className="w-full mt-3 text-sm font-medium text-surface-500 hover:text-surface-700"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface-0 rounded-2xl overflow-hidden shadow-elevated border-success-200"
                    >
                        <div className="bg-success-50 py-8 px-6 border-b border-success-100 text-center">
                            <div className="w-16 h-16 bg-success-100 text-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-surface-900 mb-2">Checked In Successfully!</h2>
                            <p className="text-surface-600">Enjoy your meal at the table.</p>
                        </div>
                        <div className="p-6 text-center">
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-all bg-surface-100 text-surface-800 hover:bg-surface-200 px-8 py-3"
                            >
                                Back to Home
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
