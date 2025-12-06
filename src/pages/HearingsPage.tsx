// HearingsPage is deprecated — the Calendar view at /hearings is the canonical page now.
import React from 'react';

export const HearingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm text-yellow-700">This page is deprecated. Use the Calendar view at <strong>/hearings</strong>.</p>
      </div>
    </div>
  );
};

export default HearingsPage;
