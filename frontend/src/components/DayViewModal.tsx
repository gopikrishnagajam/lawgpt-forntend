import { X, Clock, User, Phone, Briefcase } from 'lucide-react';
import type { CalendarHearing } from '@/types/case.types';
import { useNavigate } from 'react-router-dom';

interface DayViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  hearings: CalendarHearing[];
}

export const DayViewModal = ({ isOpen, onClose, dateStr, hearings }: DayViewModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{new Date(dateStr).toLocaleDateString()}</h3>
            <p className="text-sm text-gray-500">Day view — all hearings for the day</p>
          </div>
          <button onClick={onClose} aria-label="Close day view" title="Close" className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {hearings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hearings scheduled for this date</p>
            </div>
          ) : (
            hearings.map((hearing) => (
              <div
                key={hearing.id}
                onClick={() => navigate(`/cases/${hearing.case_id}`)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-500">{hearing.case_number}</span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700">{hearing.case_type}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{hearing.case_title}</h4>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(hearing.hearing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{hearing.hearing_type}</span>
                  </div>
                  {hearing.court_name && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="truncate">{hearing.court_name}</span>
                    </div>
                  )}
                  {hearing.judge_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{hearing.judge_name}</span>
                    </div>
                  )}

                  {hearing.client && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="font-medium text-gray-700">Client</div>
                      <div className="mt-1">{hearing.client.name}</div>
                      {hearing.client.phone && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{hearing.client.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DayViewModal;
