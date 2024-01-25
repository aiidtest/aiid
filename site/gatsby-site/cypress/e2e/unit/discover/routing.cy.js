import parseURL from '../../../../../gatsby-site/src/components/discover/parseURL';
import createURL from '../../../../../gatsby-site/src/components/discover/createURL';
import { queryConfig } from '../../../../../gatsby-site/src/components/discover/queryParams';

chai.config.truncateThreshold = 0;

describe('Discover routing', () => {
  it('Should parse back and forth a discover URL', () => {
    const indexName = 'instant_search-en';

    const location = {
      search:
        '?authors=Christopher%20Knaus%7C%7CSam%20Levin&classifications=CSETv0%3AIntent%3AAccident&display=details&epoch_date_published_max=1670371200&is_incident_report=true&page=1&s=tesla&sortBy=published-date-asc&source_domain=theguardian.com',
    };

    const result = parseURL({ location, indexName, queryConfig });

    const state = result[indexName];

    expect(state.query).to.eq('tesla');
    expect(state.page).to.eq(1);
    expect(state.sortBy).to.eq('published-date-asc');
    expect(state.refinementList).to.deep.eq({
      source_domain: ['theguardian.com'],
      authors: ['Christopher Knaus', 'Sam Levin'],
      'CSETv0.Intent': ['Accident'],
      is_incident_report: ['true'],
      display: ['details'],
    });
    expect(state.range).to.deep.eq({
      epoch_date_published: `:1670371200`,
    });

    expect(state.configure).to.deep.eq({
      distinct: false,
      hitsPerPage: 28,
    });

    const resultURL = createURL({
      routeState: { [indexName]: state },
      indexName,
      locale: 'en',
      queryConfig,
      taxa: ['CSETv0', 'CSETv1'],
    });

    expect('?' + resultURL).to.eq(location.search);
  });
});
