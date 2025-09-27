import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface AuthProps {
    onSignInSuccess: () => void;
}

type AuthStep = 'initial' | 'mobile_input' | 'otp_verify';

const Auth: React.FC<AuthProps> = ({ onSignInSuccess }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<AuthStep>('initial');
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const otpInputRef = useRef<HTMLInputElement>(null);

    const SIMULATED_OTP = '123456';

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        if (step === 'otp_verify' && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [step]);
    
    const resetState = () => {
        setError('');
        setIsProcessing(false);
    }

    const handleGoogleSignIn = () => {
        setIsProcessing(true);
        resetState();
        setTimeout(() => {
            setIsProcessing(false);
            onSignInSuccess();
        }, 1000);
    };

    const handleMobileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
            setError(t('auth.invalidMobile'));
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setStep('otp_verify');
            setCountdown(30); 
        }, 1500);
    };
    
    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        resetState();
        if (otp === SIMULATED_OTP) {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                onSignInSuccess();
            }, 1000);
        } else {
            setError(t('auth.invalidOtp'));
        }
    };
    
    const handleResendOtp = () => {
        if (countdown > 0) return;
        resetState();
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setCountdown(30);
        }, 1500);
    }
    
    const renderInitial = () => (
        <div className="space-y-4">
            <button onClick={handleGoogleSignIn} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-base-300 hover:bg-brand-primary text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.631,44,30.865,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                {t('auth.signInWithGoogle')}
            </button>
            <div className="flex items-center">
                <div className="flex-grow border-t border-base-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">{t('auth.or')}</span>
                <div className="flex-grow border-t border-base-300"></div>
            </div>
            <button onClick={() => setStep('mobile_input')} className="w-full bg-brand-secondary hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-opacity duration-300">
                {t('auth.signInWithMobile')}
            </button>
        </div>
    );

    const renderMobileInput = () => (
        <form onSubmit={handleMobileSubmit} className="space-y-4">
             <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-2">{t('auth.mobileNumberLabel')}</label>
                <input
                    id="mobile"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t('auth.mobileNumberPlaceholder')}
                    className="w-full p-3 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200"
                    required
                />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={isProcessing} className="w-full bg-brand-secondary hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-300 disabled:opacity-50">
                {isProcessing ? t('editor.generating') : t('auth.sendOtp')}
            </button>
            <button type="button" onClick={() => setStep('initial')} className="w-full text-center text-sm text-gray-400 hover:text-white mt-2">{t('auth.goBack')}</button>
        </form>
    );

    const renderOtpVerify = () => (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">{t('auth.otpLabel')}</label>
                 <input
                    ref={otpInputRef}
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('auth.otpPlaceholder')}
                    className="w-full p-3 bg-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-gray-200 text-center text-lg tracking-[0.5em]"
                    required
                />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
             <button type="submit" disabled={isProcessing} className="w-full bg-brand-secondary hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-300 disabled:opacity-50">
                {isProcessing ? t('editor.generating') : t('auth.verifyOtp')}
            </button>
            <div className="text-center text-sm">
                {countdown > 0 ? (
                    <p className="text-gray-400">{t('auth.resendOtpIn')} {countdown}s</p>
                ) : (
                    <button type="button" onClick={handleResendOtp} className="text-brand-light hover:underline">{t('auth.resendOtp')}</button>
                )}
            </div>
            <button type="button" onClick={() => { setStep('mobile_input'); setOtp(''); }} className="w-full text-center text-sm text-gray-400 hover:text-white mt-2">{t('auth.goBack')}</button>
        </form>
    );
    
    return (
        <div className="w-full max-w-sm mx-auto bg-base-200 p-8 rounded-2xl shadow-lg border border-base-300 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-white mb-6">{t('auth.title')}</h2>
            {step === 'initial' && renderInitial()}
            {step === 'mobile_input' && renderMobileInput()}
            {step === 'otp_verify' && renderOtpVerify()}
        </div>
    );
};

export default Auth;
