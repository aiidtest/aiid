const { default: slugify } = require('slugify');

const isArray = require('lodash/isArray');

const idHash = {};

const getName = (entities, id) => {
  if (!idHash[id]) {
    const entity = entities.find((entity) => entity.entity_id == id);

    idHash[id] = entity ? entity.name : id;
  }

  return idHash[id];
};

const getEntityId = (name) => {
  return slugify(name, { lower: true });
};

module.exports.getEntityId = getEntityId;

module.exports.computeEntities = ({ incidents, entities, responses }) => {
  const entitiesHash = {};

  const entityFields = [
    {
      property: 'Alleged_deployer_of_AI_system',
      key: 'incidentsAsDeployer',
    },
    {
      property: 'Alleged_developer_of_AI_system',
      key: 'incidentsAsDeveloper',
    },
    {
      property: 'Alleged_harmed_or_nearly_harmed_parties',
      key: 'incidentsHarmedBy',
    },
    {
      property: 'implicated_systems',
      key: 'incidentsImplicatedSystems',
    },
  ];

  const harmingProperties = ['Alleged_deployer_of_AI_system', 'Alleged_developer_of_AI_system'];

  const harmedProperties = ['Alleged_harmed_or_nearly_harmed_parties'];

  const otherProperties = ['implicated_systems'];

  for (const incident of incidents) {
    const { incident_id, reports } = incident;

    const incidentResponses = responses.filter((response) => {
      return reports.some((report) => report.report_number === response.report_number);
    });

    for (const field of entityFields) {
      const ids = incident[field.property];

      if (!ids) continue;
      for (const id of ids) {
        const name = getName(entities, id);

        if (!entitiesHash[id]) {
          entitiesHash[id] = {
            id,
            name,
            incidentsAsDeveloper: [],
            incidentsAsDeployer: [],
            incidentsAsBoth: [],
            relatedEntities: [],
            incidentsHarmedBy: [],
            harmedEntities: [],
            responses: [],
            incidentsImplicatedSystems: [],
          };
        }

        if (harmingProperties.some((f) => f == field.property)) {
          const isBoth = harmingProperties.every((property) =>
            incident[property].some((entityId) => entityId === id)
          );

          if (isBoth) {
            if (!entitiesHash[id].incidentsAsBoth.includes(incident_id)) {
              entitiesHash[id].incidentsAsBoth.push(incident_id);
            }
          } else {
            if (!entitiesHash[id][field.key].some((i) => i.incident_id == incident_id)) {
              entitiesHash[id][field.key].push(incident_id);
            }
          }
        }

        if (harmedProperties.some((f) => f === field.property)) {
          if (!entitiesHash[id][field.key].some((i) => i.incident_id == incident_id)) {
            entitiesHash[id][field.key].push(incident_id);
          }
        }

        if (otherProperties.some((f) => f === field.property)) {
          if (!entitiesHash[id][field.key].some((i) => i.incident_id == incident_id)) {
            entitiesHash[id][field.key].push(incident_id);
          }
        }

        for (const incidentResponse of incidentResponses) {
          if (
            !entitiesHash[id].responses.some(
              (r) => r.report_number == incidentResponse.report_number
            )
          ) {
            entitiesHash[id].responses.push({ ...incidentResponse, incident_id });
          }
        }
      }
    }
  }

  for (const id in entitiesHash) {
    entitiesHash[id].relatedEntities = incidents
      .filter((incident) => entityFields.some((field) => incident[field.property].includes(id)))
      .reduce((related, incident) => {
        for (const field of entityFields) {
          const ids = incident[field.property];

          if (!ids) continue;
          for (const relatedId of ids) {
            if (relatedId !== id && !related.some((r) => r == relatedId)) {
              related.push(relatedId);
            }
          }
        }

        return related;
      }, []);

    entitiesHash[id].harmedEntities = incidents
      .filter((incident) =>
        [
          ...entitiesHash[id].incidentsAsBoth,
          ...entitiesHash[id].incidentsAsDeployer,
          ...entitiesHash[id].incidentsAsDeveloper,
          ...entitiesHash[id].incidentsImplicatedSystems,
        ].includes(incident.incident_id)
      )
      .reduce((harmed, incident) => {
        for (const property of harmedProperties) {
          for (const harmedId of incident[property]) {
            if (harmedId !== id && !harmed.some((r) => r == harmedId)) {
              harmed.push(harmedId);
            }
          }
        }

        return harmed;
      }, []);
  }

  return Object.values(entitiesHash);
};

module.exports.makeIncidentsHash = (incidents) =>
  incidents.reduce((hash, incident) => {
    hash[incident.incident_id] = incident;
    return hash;
  }, {});

module.exports.makeEntitiesHash = (entities, entityRelationships = []) =>
  entities.reduce((hash, entity) => {
    entity.entityRelationships =
      entityRelationships?.filter(
        (relationship) => relationship.sub === entity.id || relationship.obj === entity.id
      ) || [];
    hash[entity.id] = entity;
    return hash;
  }, {});

// Save new Entities into "entities" collection
module.exports.processEntities = async (allEntities, entitiesNames, createEntityMutation) => {
  entitiesNames = entitiesNames
    ? !isArray(entitiesNames)
      ? entitiesNames.split(',').map((s) => s.trim())
      : entitiesNames
    : [];

  const entityIds = [];

  for (const entityName of entitiesNames) {
    const entityId = getEntityId(entityName.customOption ? entityName.label : entityName);

    entityIds.push(entityId);

    if (!allEntities.find((entity) => entity.entity_id === entityId)) {
      await createEntityMutation({
        variables: {
          filter: {
            entity_id: { EQ: entityId },
          },
          update: {
            entity_id: entityId,
            name: entityName.customOption ? entityName.label : entityName,
          },
        },
      });
    }
  }

  return { link: entityIds };
};

module.exports.RESPONSE_TAG = 'response';
