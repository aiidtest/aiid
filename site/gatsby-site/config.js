const config = {
  gatsby: {
    pathPrefix: '/',
    siteUrl: 'https://incidentdatabase.ai',
    gaTrackingId: 'UA-23867277-2',
  },
  realm: {
    review_db: {
      realm_app_id: process.env.GATSBY_REALM_APP_ID,
      db_service: 'mongodb-atlas',
      db_name: 'aiidprod',
      db_collection: 'submissions',
    },
    production_db: {
      realm_app_id: process.env.GATSBY_REALM_APP_ID,
      db_service: 'mongodb-atlas',
      db_name: 'aiidprod',
      db_collection: 'incidents',
      realm_app_graphql_url: process.env.GATSBY_REALM_APP_GRAPHQL_URL,
    },
    graphqlApiKey: process.env.REALM_GRAPHQL_API_KEY,
  },
  header: {
    logo: '/logos/White_Transparent_AIID_short.png',
    logoMobile: '/White_Transparent_AIID.png',
    logoLink: '/',
    title: ' AI Incident Database',
    githubUrl: 'https://github.com/responsible-ai-collaborative/aiid',
    helpUrl: '',
    tweetText: '',
    social: `<li>
		    <a href="https://twitter.com/IncidentsDB" target="_blank" rel="noopener">
		      <div class="twitterBtn">
		        <img src='/twitter-brands-block.svg' alt={'Twitter'}/>
		      </div>
		    </a>
		  </li>`,
    links: [{ text: '', link: '' }],
    search: {
      enabled: false,
      indexName: '',
      algoliaAppId: process.env.GATSBY_ALGOLIA_APP_ID || 'JD5JCVZEVS',
      algoliaSearchKey: process.env.GATSBY_ALGOLIA_SEARCH_KEY || 'c5e99d93261645721a1765fe4414389c',
      algoliaAdminKey: process.env.ALGOLIA_ADMIN_KEY,
      featured: {
        /* <report_number>: <priority>
         *
         * (The higher the priority, the earlier an item will appear in the initial results)
         */
        23: 2, // Is Starbucks shortchanging its baristas?
        12: 1, // YouTube says it will crack down on bizarre videos targeting children
        45: 1, // Google's Anti-Bullying AI Mistakes Civility for Decency
        101: 1, // Google Photo App Labels Black Couple 'Gorillas'
        217: 1, // Tougher Turing Test Exposes Chatbots’ Stupidity
        368: 1, // Because Stanislav Petrov reported a computer malfunction in 1983, we know him today as "The man who saved the world"
        392: 1, // 'Flash Crash' arrest shakes investors' confidence
        519: 1, // TV news report prompts viewers' Amazon Echo devices to order unwanted dollhouses
        595: 1, // Chinese AI traffic cam mistook a bus ad for a human and publicly shamed the CEO it depicted for jaywalking
        620: 1, // Is AI Sexist?
        679: 1, // A.I. Video Depicting Barack Obama Shows Dangers of Fake News
        835: 1, // LinkedIn’s search algorithm apparently favored men until this week
        1065: 1, // Centrelink robo-debt 'abject failure' and arguably unlawful, Victoria Legal Aid says
        1118: 1, // That Viral 'FaceApp' Is Making Everyone Look Whiter
        1235: 1, // Security robot 'drowns itself' in office fountain
        1245: 1, // Robot Stabs A Man To Death At A Factory In Haryana's Manesar!
        1374: 1, // Tay (bot)
        1420: 1, // South Korean AI chatbot pulled from Facebook after hate speech towards minorities
        1427: 1, // Fired by Bot at Amazon: ‘It’s You Against the Machine’
        1468: 1, // TikTok Deleted My Account Because I’m a Latina Trans Woman
        1470: 1, // The Death and Life of an Admissions Algorithm
        1505: 1, // Students of color are getting flagged to their teachers because testing software can’t see them
        1509: 1, // Humanoid Robot Keeps Getting Fired From His Jobs
        1539: 1, // Why Stanford Researchers Tried to Create a ‘Gaydar’ Machine
        1543: 1, // How Wrongful Arrests Based on AI Derailed 3 Men's Lives
        1551: 1, // Hundreds of AI tools have been built to catch covid. None of them helped.
        1561: 1, // A new AI draws delightful and not-so-delightful images
        1606: 1, // Driverless car starts to pull away after being stopped by police
        1773: 1, // Chess robot goes rogue, breaks seven-year-old player's finger
      },
    },
  },
  sidebar: {
    navConfig: [
      { label: 'welcome', url: '/', items: [], title: 'Welcome to the AIID' },
      { label: 'about', url: '/about', items: [], title: 'About' },
      { label: 'blog', url: '/blog', items: [], title: 'AIID Blog' },
      {
        label: 'about_apps',
        url: '/about_apps',
        items: [
          { label: 'discover', url: '/apps/discover', items: [], title: 'Discover Incidents' },
          { label: 'submit', url: '/apps/submit', items: [], title: 'Submit Incident Reports' },
          {
            label: 'all-incidents',
            url: '/summaries/incidents',
            items: [],
            title: 'All Incidents in List Form',
          },
          {
            label: 'leaderboard',
            url: '/summaries/leaderboard',
            items: [],
            title: 'Submission Leaderboard',
          },
          {
            label: 'classifications',
            url: '/apps/classifications',
            items: [],
            title: 'Classifications View',
          },
          { label: 'flagged', url: '/summaries/flagged', items: [], title: 'Flagged Incidents' },
          { label: 'wordcounts', url: '/summaries/wordcounts', items: [], title: 'Word Counts' },
        ],
        title: 'Database Apps',
      },
      {
        label: 'research',
        url: '/research',
        items: [
          {
            label: '1-criteria',
            url: '/research/1-criteria',
            items: [],
            title: 'Incident Report Acceptance Criteria',
          },
          { label: '2-roadmap', url: '/research/2-roadmap', items: [], title: 'Database Roadmap' },
          {
            label: '3-history',
            url: '/research/3-history',
            items: [],
            title: 'Initial Collection Methodology',
          },
        ],
        title: 'Researcher Guide',
      },
      { label: 'taxonomies', url: '/taxonomies', items: [], title: 'Taxonomies' },
      { label: 'contact', url: '/contact', items: [], title: 'Contact and Follow' },
    ],
    links: [
      { text: 'Launch Announcement', link: 'https://partnershiponai.org/aiincidentdatabase/' },
    ],
    frontline: true,
    ignoreIndex: false,
    title: '',
  },
  siteMetadata: {
    title: 'Artificial Intelligence Incident Database',
    description: 'a collection of intelligent system harms in the real world ',
    ogImage: null,
    docsLocation: '/',
    favicon: '/favicon.png',
    twitterAccount: '@IncidentsDB',
  },
  pwa: {
    enabled: false, // disabling this will also remove the existing service worker.
    manifest: {
      name: 'The Artificial Intelligence Incident Database',
      short_name: 'AIID',
      start_url: '/',
      background_color: '#6b37bf',
      theme_color: '#6b37bf',
      display: 'standalone',
      crossOrigin: 'use-credentials',
      icons: [
        {
          src: 'src/pwa-512.png',
          sizes: `512x512`,
          type: `image/png`,
        },
      ],
    },
  },
  cloudinary: {
    cloudName: 'pai',
  },
  mongodb: {
    connectionString: process.env.MONGODB_CONNECTION_STRING,
    replicaSet: process.env.MONGODB_REPLICA_SET,
    translationsConnectionString: process.env.MONGODB_TRANSLATIONS_CONNECTION_STRING,
  },
  google: {
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  },
  i18n: {
    availableLanguages: String(process.env.GATSBY_AVAILABLE_LANGUAGES).split(',') || ['en'],
    translateApikey: process.env.GOOGLE_TRANSLATE_API_KEY,
    defaultLanguage: 'en',
  },
};

module.exports = config;
