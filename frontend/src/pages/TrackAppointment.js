import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';

const statusInfo = {
  pending:   { icon: '⏳', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30', msgColor: 'text-yellow-800 dark:text-yellow-200', label: 'Pending',   message: 'Your appointment request has been received and is awaiting confirmation.' },
  confirmed: { icon: '✅', color: 'text-green-700 dark:text-green-300',   bg: 'bg-green-100 dark:bg-green-900/30',   msgColor: 'text-green-800 dark:text-green-200',   label: 'Confirmed', message: 'Your appointment is confirmed. Please arrive 10 minutes early.' },
  completed: { icon: '🎉', color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-100 dark:bg-blue-900/30',     msgColor: 'text-blue-800 dark:text-blue-200',     label: 'Completed', message: 'Your appointment has been completed. Thank you for visiting us!' },
  cancelled: { icon: '❌', color: 'text-red-700 dark:text-red-300',       bg: 'bg-red-100 dark:bg-red-900/30',       msgColor: 'text-red-800 dark:text-red-200',       label: 'Cancelled', message: 'This appointment has been cancelled. Please book a new one if needed.' },
};

const TrackAppointment = () => {
  const { token } = useParams();
  const [trackingToken, setTrackingToken] = useState(token || '');
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) fetchAppointment(token);
  }, [token]); // eslint-disable-line

  const fetchAppointment = async (t) => {
    setLoading(true);
    setError('');
    setAppointment(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/appointments/${t}`);
      if (res.status === 404) throw new Error('not_found');
      if (!res.ok) throw new Error('server_error');
      const data = await res.json();
      setAppointment(data);
    } catch (err) {
      if (err.message === 'not_found') {
        setError('No appointment found with that token. Please check and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    const t = trackingToken.trim();
    if (!t) { setError('Please enter your tracking token'); return; }
    fetchAppointment(t);
  };

  const info = appointment ? (statusInfo[appointment.status] || statusInfo.pending) : null;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-gray-800 dark:text-white mb-2">Track Your Appointment</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Enter the tracking token from your confirmation email to view your appointment status.
          </p>
        </GlassCard>

        {loading && (
          <GlassCard className="p-8 text-center">
            <div className="flex items-center justify-center space-x-3 text-gray-600 dark:text-gray-300">
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span>Looking up your appointment...</span>
            </div>
          </GlassCard>
        )}

        {!appointment && !loading && error && token && (
          <GlassCard className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <GlassButton onClick={() => window.location.href = '/track-appointment'}>
              Try Again
            </GlassButton>
          </GlassCard>
        )}

        {!appointment && !loading && (
          <GlassCard className="p-8 mb-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <GlassInput
                label="Tracking Token"
                name="token"
                value={trackingToken}
                onChange={(e) => setTrackingToken(e.target.value)}
                error={error}
                placeholder="Paste your tracking token here"
                required
              />
              <GlassButton type="submit" loading={loading} disabled={loading} className="w-full">
                {loading ? 'Looking up...' : 'Track Appointment'}
              </GlassButton>
            </form>

            <div className="mt-6 p-4 bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start space-x-3">
              <span className="text-amber-500 text-lg mt-0.5">🔒</span>
              <p className="text-amber-700 dark:text-amber-300 text-xs">
                Your tracking token was sent to your email after booking. Keep it private — it gives access to your appointment details.
              </p>
            </div>
          </GlassCard>
        )}

        {appointment && info && (
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-800 dark:text-white text-lg font-semibold">Appointment Details</h2>
              <GlassButton variant="secondary" size="sm" onClick={() => { setAppointment(null); setTrackingToken(''); }}>
                Check Another
              </GlassButton>
            </div>

            {/* Status */}
            <div className={`flex items-center space-x-4 p-4 rounded-lg mb-6 ${info.bg}`}>
              <span className="text-3xl">{info.icon}</span>
              <div>
                <p className={`font-semibold text-lg ${info.color}`}>{info.label}</p>
                <p className={`text-sm ${info.msgColor}`}>{info.message}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-800 dark:text-white">{appointment.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Service</p>
                  <p className="font-medium text-gray-800 dark:text-white">{appointment.service}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {(() => {
                      const datePart = appointment.date
                        ? appointment.date.split('T')[0]
                        : null;
                      if (!datePart) return 'Not specified';
                      const [year, month, day] = datePart.split('-').map(Number);
                      return new Date(year, month - 1, day).toLocaleDateString('en-KE', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      });
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {appointment.time
                      ? (() => {
                          const [h, m] = appointment.time.split(':').map(Number);
                          const suffix = h >= 12 ? 'PM' : 'AM';
                          const hour = h % 12 || 12;
                          return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
                        })()
                      : appointment.date && appointment.date.includes('T')
                        ? (() => {
                            const timePart = appointment.date.split('T')[1].substring(0, 5);
                            const [h, m] = timePart.split(':').map(Number);
                            const suffix = h >= 12 ? 'PM' : 'AM';
                            const hour = h % 12 || 12;
                            return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
                          })()
                        : 'Not specified'
                    }
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Booked On</p>
                  <p className="font-medium text-gray-800 dark:text-white">{new Date(appointment.created_at).toLocaleString()}</p>
                </div>
              </div>

              {appointment.message && (
                <div className="p-4 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Your Note</p>
                  <p className="text-gray-700 dark:text-gray-300">{appointment.message}</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              Need to reschedule or cancel? Call us at <strong>0768103599</strong> or email <strong>esenapharmacy@gmail.com</strong>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default TrackAppointment;
