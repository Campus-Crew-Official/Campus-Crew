import React, { useState } from 'react';
import { Modal } from './Modal';
import { QrCode, ScanLine, Check, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import confetti from 'canvas-confetti';

export const QRScannerModal = ({ isOpen, onClose, event, onCheckInSuccess }) => {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastCheckedStudent, setLastCheckedStudent] = useState(null);
  const { addToast } = useToast();

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!ticketInput.trim() || !event) return;

    setLoading(true);
    setLastCheckedStudent(null);

    try {
      // Check if ticketInput is JSON (from scanned QR payload) or plain ticketCode string
      let parsedCode = ticketInput.trim();
      let parsedSecret = event.checkInSecret;

      try {
        const json = JSON.parse(parsedCode);
        if (json.ticketCode) parsedCode = json.ticketCode;
        if (json.checkInSecret) parsedSecret = json.checkInSecret;
      } catch (err) {
        // Plain string ticket code
      }

      const res = await api.post('/attendance/checkin-qr', {
        ticketCode: parsedCode,
        checkInSecret: parsedSecret,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      setLastCheckedStudent(res.data.user);
      addToast(`Checked in: ${res.data.user.name}`, 'success');
      setTicketInput('');
      if (onCheckInSuccess) onCheckInSuccess(res.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Participant QR Check-In Scanner" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* Visual Scanner Box */}
        <div className="relative h-48 bg-slate-900 rounded-2xl border-2 border-dashed border-brand-500/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-brand-500/10 pointer-events-none animate-pulse"></div>
          {/* Animated scanning laser line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand-400 shadow-[0_0_12px_#818cf8] animate-bounce"></div>

          <ScanLine className="w-14 h-14 text-brand-400 mb-2 opacity-80" />
          <span className="text-xs text-brand-200 font-medium">Ready for Ticket Verification</span>
          <span className="text-[11px] text-slate-400 mt-1">Event: {event?.title}</span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ticket Code or QR Payload
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. TKT-HC26-8901 or scan data"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-sm uppercase transition-all"
                autoFocus
              />
              <QrCode className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !ticketInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold shadow-md shadow-brand-600/20 transition-all active:scale-98"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Verify & Record Attendance
          </button>
        </form>

        {/* Verified banner */}
        {lastCheckedStudent && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
              ✓
            </div>
            <div>
              <h5 className="font-bold text-sm">{lastCheckedStudent.name}</h5>
              <p className="text-xs text-emerald-700">
                Roll: {lastCheckedStudent.rollNumber} • {lastCheckedStudent.department}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
