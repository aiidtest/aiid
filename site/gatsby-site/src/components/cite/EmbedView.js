import React from 'react';
import { Trans } from 'react-i18next';
import config from '../../../config';

const EmbedView = ({ incident_id }) => {
  if(!incident_id) {
    return <div className="p-4 text-center">No incident found</div>;
  }

  const fullIncidentUrl = `${config.gatsby.siteUrl}/cite/${incident_id}`;

  return (
    <div className="p-4 text-center bg-white min-h-screen flex items-center justify-center">
      <a
        href={fullIncidentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-white text-gray-700 border-2 border-blue-600 rounded hover:bg-gray-50 hover:text-gray-900 transition-colors"
      >
        <Trans>View Incident #{incident_id} on the AIID</Trans>
      </a>
    </div>
  );
};

export default EmbedView; 