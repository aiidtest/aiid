import React, { useEffect, useState } from 'react';
import EmbedView from '../components/cite/EmbedView';

const EmbedTemplate = ({ location }) => {
  const [incidentId, setIncidentId] = useState(() => {
    if(typeof window !== 'undefined') {
      const params = new URLSearchParams(location.search);
      return params.get('incidentId');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const directIncidentId = params.get('incidentId');
    const url = params.get('urls');

    if(directIncidentId) {
      setIncidentId(directIncidentId);
      setLoading(false);
    }
    else if(url) {
      fetch(`/api/lookupbyurl?urls=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
          const firstResult = data.results[0];
          if(firstResult && firstResult.incidents.length > 0) {
            setIncidentId(firstResult.incidents[0].incident_id);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
    else {
      setLoading(false);
    }
  }, [location.search]);

  const params = new URLSearchParams(location.search);
  const directIncidentId = params.get('incidentId');

  if(directIncidentId) {
    return <EmbedView incident_id={directIncidentId} />;
  }

  if(loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return <EmbedView incident_id={incidentId} />;
};

export default EmbedTemplate; 