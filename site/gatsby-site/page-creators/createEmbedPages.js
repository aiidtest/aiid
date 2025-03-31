const path = require('path');
const { switchLocalizedPath } = require('../i18n');
const fs = require('fs');

const createEmbedPages = async (graphql, createPage, { languages }) => {

  const result = await graphql(
    `
      query EmbedPagesQuery {
        allMongodbAiidprodIncidents(sort: { incident_id: ASC }) {
          nodes {
            incident_id
            title
            description
            date
            reports {
              report_number
              title
              url
              authors
              date_published
              source_domain
            }
          }
        }
      }
    `
  );

  const { allMongodbAiidprodIncidents } = result.data;

  const pageContexts = [];

  allMongodbAiidprodIncidents.nodes.forEach((incident) => {
    pageContexts.push({
      incident,
      incident_id: incident.incident_id,
    });
  });

  // Create the main /embed route for handling query parameters
  for (const language of languages) {
    const pagePath = switchLocalizedPath({
      newLang: language.code,
      path: '/embed',
    });

    createPage({
      path: pagePath,
      component: path.resolve('./src/templates/embed.js'),
      context: {
        originalPath: pagePath,
        locale: language.code,
        hrefLang: language.hrefLang,
      },
    });
  }

  // Create individual embed pages for direct incident access
  for (const language of languages) {
    for (const context of pageContexts) {
      const pagePath = switchLocalizedPath({
        newLang: language.code,
        path: '/cite/embed/' + context.incident_id + '/',
      });

      createPage({
        path: pagePath,
        component: path.resolve('./src/templates/embed.js'),
        context: {
          ...context,
          originalPath: pagePath,
          locale: language.code,
          hrefLang: language.hrefLang,
        },
      });
    }
  }
};

module.exports = createEmbedPages; 