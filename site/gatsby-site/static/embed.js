(function () {
  let lookupData = {};

  const styles = {
    container: `
      display: inline-block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `,
    button: `
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
      margin-right: 8px;
    `,
    buttonHover: `
      background-color: #1d4ed8;
    `,
    buttonContainer: `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    `,
  };

  function isValidURL(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function hashString(str) {
    let h1 = 0x811c9dc5;

    let h2 = 0x811c9dc5;

    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);

      h1 ^= c;
      h2 ^= c;

      h1 = (h1 * 16777619) >>> 0;
      h2 = (h2 * 16777619) >>> 0;
    }

    // Combine the two hashes into a single string
    return h1.toString(36) + h2.toString(36);
  }

  function normalizeURL(url) {
    const parsedURL = new URL(url);

    return parsedURL.host + parsedURL.pathname;
  }

  function findIncidentIdsByReportUrl(url) {
    if (!isValidURL(url)) return [];

    const normalizedUrl = normalizeURL(url);

    const urlHash = hashString(normalizedUrl);

    return lookupData[urlHash] || [];
  }

  async function initializeEmbeds() {
    const scriptEl = document.currentScript;

    if (!scriptEl) {
      console.error('Could not find the embed script element');
      return;
    }

    const baseUrl = scriptEl.src.replace('/embed.js', '');

    try {
      const res = await fetch(`${baseUrl}/lookupIndex.json`);

      if (!res.ok) {
        console.error('Could not retrieve lookup index file');
        return;
      }

      lookupData = await res.json();
    } catch (err) {
      console.error('Error fetching lookup index file:', err);
      return;
    }

    const embedContainers = document.querySelectorAll('.aiid-embed');

    for (const container of embedContainers) {
      container.style.cssText = styles.container;

      const incidentId = container.dataset.incidentId;

      const reportUrl = container.dataset.reportUrl;

      let incidentIds = [];

      if (incidentId) {
        incidentIds = [incidentId];
      } else if (reportUrl) {
        incidentIds = findIncidentIdsByReportUrl(reportUrl);
      }

      if (!incidentIds.length) {
        container.textContent = 'No associated incidents were found.';
        continue;
      }

      const buttonContainer = document.createElement('div');

      buttonContainer.style.cssText = styles.buttonContainer;

      for (const id of incidentIds) {
        const link = document.createElement('a');

        link.href = `${baseUrl}/cite/${id}`;
        link.textContent = `See it on the AIID #${id}`;
        link.style.cssText = styles.button;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        link.addEventListener('mouseenter', () => {
          link.style.cssText = styles.button + styles.buttonHover;
        });
        link.addEventListener('mouseleave', () => {
          link.style.cssText = styles.button;
        });

        buttonContainer.appendChild(link);
      }

      container.innerHTML = '';
      container.appendChild(buttonContainer);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEmbeds);
  } else {
    initializeEmbeds();
  }
})();
