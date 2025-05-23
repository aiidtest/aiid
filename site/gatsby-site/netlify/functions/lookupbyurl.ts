import { withSentry } from '../../sentry-instrumentation';
import siteConfig from '../../config';
import OpenAPIRequestValidator from 'openapi-request-validator';
import spec from '../../static/spec.json';
import { HandlerEvent } from '@netlify/functions';

const requestValidator = new OpenAPIRequestValidator({
  parameters: spec.paths['/api/lookupbyurl'].get.parameters,
});

const isValidURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

async function handler(event: HandlerEvent) {
  const parsedUrl = new URL(event.rawUrl);

  const urls = [...parsedUrl.searchParams.getAll('urls'), ...parsedUrl.searchParams.getAll('urls[]')];

  const errors = requestValidator.validateRequest({ query: { urls } });

  if (errors) {
    return {
      statusCode: 400,
      body: JSON.stringify(errors),
    };
  }

  const index = require('./lookupIndex.json');

  const results = [];

  for (const url of urls) {
    const result = { url, reports: [], incidents: [] };

    const parsedURL = new URL(url);

    const incidents = index.reduce((filtered, incident) => {
      if (
        incident.r
          // some reports are missing the url, it should be fixed in the source but for now we'll filter them out
          // https://github.com/responsible-ai-collaborative/aiid/issues/2664
          .filter((report) => isValidURL(report.u))
          .some((report) => {
            const reportURL = new URL(report.u);

            return reportURL.host + reportURL.pathname === parsedURL.host + parsedURL.pathname;
          })
      ) {
        filtered.push({
          incident_id: incident.i,
          title: incident.t,
          url: `${siteConfig.gatsby.siteUrl}/cite/${incident.i}`,
        });
      }
      return filtered;
    }, []);

    result.incidents = incidents;

    const reports = index.reduce((filtered, incident) => {
      incident.r
        .filter((report) => isValidURL(report.u))
        .forEach((report) => {
          const reportURL = new URL(report.u);

          if (reportURL.host + reportURL.pathname === parsedURL.host + parsedURL.pathname) {
            filtered.push({
              report_number: report.n,
              title: report.t,
              url: report.u,
            });
          }
        });

      return filtered;
    }, []);

    result.reports = reports;
    results.push(result);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ results }),
  };
}

module.exports = { handler: withSentry(handler) };