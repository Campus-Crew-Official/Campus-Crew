import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Calendar, MapPin, User, Ticket, Download, CheckCircle2 } from 'lucide-react';

export const TicketModal = ({ isOpen, onClose, registration, event }) => {
  if (!registration || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Event Entry Pass" maxWidth="max-w-md">
      <div className="flex flex-col items-center">
        {/* Pass card with perforated edges visual styling */}
        <div className="w-full bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-indigo-800/40">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-brand-500/20 rounded-full blur-2xl"></div>

          {/* Top header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-brand-300 uppercase bg-brand-900/60 px-2.5 py-1 rounded-full border border-brand-500/30">
                {event.category || 'CAMPUS EVENT'}
              </span>
              <h4 className="text-lg font-bold mt-2 text-white line-clamp-1">{event.title}</h4>
            </div>
            <Ticket className="w-6 h-6 text-brand-400 shrink-0" />
          </div>

          {/* Event details */}
          <div className="space-y-2 py-3 border-y border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
              <span>{new Date(event.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Attendee: {registration.user?.name || 'Registered Student'}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center pt-6 pb-2">
            <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-white">
              <QRCodeSVG
                value={JSON.stringify({
                  ticketCode: registration.ticketCode,
                  checkInSecret: event.checkInSecret,
                })}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="font-mono text-sm tracking-wider font-bold mt-4 text-brand-200">
              {registration.ticketCode}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed Reservation
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full mt-6">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-md shadow-brand-600/20 active:scale-98"
          >
            <Download className="w-4 h-4" /> Print or Save Entry Ticket
          </button>
        </div>
      </div>
    </Modal>
  );
};
