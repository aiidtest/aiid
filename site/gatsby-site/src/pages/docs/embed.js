import React from 'react';
import { Trans } from 'react-i18next';
import Container from '../../elements/Container';
import config from '../../../config';

const EmbedDocsPage = () => {
  // Example incident and URL for demonstration
  const exampleIncidentId = 3; // The Starbucks/Kronos incident as an example
  const exampleUrl = "https://searchhrsoftware.techtarget.com/news/4500252451/Kronos-shift-scheduling-software-a-grind-for-Starbucks-worker";

  const embedCodeIncidentId = `<iframe 
  src="${config.gatsby.siteUrl}/embed?incidentId=${exampleIncidentId}"
  width="100%" 
  height="400" 
  frameborder="0" 
  allowtransparency="true"
  style="border: 1px solid #ccc;"
></iframe>`;

  const embedCodeUrl = `<iframe 
  src="${config.gatsby.siteUrl}/embed?urls=${encodeURIComponent(exampleUrl)}"
  width="100%" 
  height="400" 
  frameborder="0" 
  allowtransparency="true"
  style="border: 1px solid #ccc;"
></iframe>`;

  return (
    <>
      <div className="titleWrapper">
        <h1>
          <Trans>Embedding AI Incidents</Trans>
        </h1>
      </div>

      <Container>
        <div className="prose max-w-none">
          <h2>
            <Trans>Overview</Trans>
          </h2>
          <p>
            <Trans>
              The AI Incident Database (AIID) provides an easy way to embed incidents in your website or blog. 
              You can embed an incident either by its ID or by providing the URL of a report that is associated with an incident.
            </Trans>
          </p>

          <h2>
            <Trans>Embedding by Incident ID</Trans>
          </h2>
          <p>
            <Trans>
              To embed a specific incident, use the incident ID from its AIID page. For example, to embed incident #{exampleIncidentId}, 
              copy and paste this code into your HTML:
            </Trans>
          </p>
          <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-4">
            <code className="whitespace-pre-wrap break-all">{embedCodeIncidentId}</code>
          </pre>

          <p>
            <Trans>Here's how it looks:</Trans>
          </p>
          <div className="border rounded-lg">
            <iframe 
              src={`/embed?incidentId=${exampleIncidentId}`}
              width="100%" 
              height="400" 
              frameBorder="0" 
              allowtransparency="true"
              style={{ border: '1px solid #ccc' }}
            />
          </div>

          <h2>
            <Trans>Embedding by URL</Trans>
          </h2>
          <p>
            <Trans>
              You can also embed an incident by providing the URL of any report that is part of an incident. 
              The system will automatically find the associated incident. For example:
            </Trans>
          </p>
          <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-4">
            <code className="whitespace-pre-wrap break-all">{embedCodeUrl}</code>
          </pre>

          <p>
            <Trans>Here's how it looks:</Trans>
          </p>
          <div className="border rounded-lg">
            <iframe 
              src={`/embed?urls=${encodeURIComponent(exampleUrl)}`}
              width="100%" 
              height="400" 
              frameBorder="0" 
              allowtransparency="true"
              style={{ border: '1px solid #ccc' }}
            />
          </div>

          <h2>
            <Trans>Customization</Trans>
          </h2>
          <p>
            <Trans>
              You can customize the appearance of the embed by modifying the iframe attributes:
            </Trans>
          </p>
          <ul>
            <li><code>width</code>: Set the width (default: "100%")</li>
            <li><code>height</code>: Set the height (default: "400")</li>
            <li><code>style</code>: Customize the border and other CSS properties</li>
          </ul>

          <h2>
            <Trans>Getting the Embed Code</Trans>
          </h2>
          <p>
            <Trans>
              When viewing any incident on AIID, click the "Embed" button next to the social share buttons. 
              This will give you the embed code for that specific incident.
            </Trans>
          </p>

          <h2>
            <Trans>Usage Guidelines</Trans>
          </h2>
          <ul>
            <li>
              <Trans>
                Please ensure you maintain the link back to the original incident on AIID
              </Trans>
            </li>
            <li>
              <Trans>
                The embed is responsive and will adapt to its container width
              </Trans>
            </li>
            <li>
              <Trans>
                Consider the height of the embed based on the amount of content - you may need to adjust it
              </Trans>
            </li>
          </ul>
        </div>
      </Container>
    </>
  );
};

export default EmbedDocsPage; 