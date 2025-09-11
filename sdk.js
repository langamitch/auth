/*
  Flow API Manager SDK (Browser)
  Usage in external projects:
  <script src="https://YOUR_DOMAIN/sdk.js" data-public-id="pub_xxx"></script>
  Then use: window.FlowAPI.request({ url, method, headers, body })

  Notes:
  - This SDK does NOT expose or return your secret API key in the client.
  - It forwards requests to your backend proxy (Cloud Function/Edge) using the publicId.
  - Implement the proxy to look up the real key by publicId and perform the request server-side.
*/
(function(){
  const PUBLIC_ID = (document.currentScript && document.currentScript.getAttribute('data-public-id')) || '';
  const DEFAULT_ENDPOINT = 'https://YOUR_CLOUD_FUNCTION_URL/proxy';

  async function request({ url, method = 'GET', headers = {}, body = undefined, endpoint = DEFAULT_ENDPOINT } = {}){
    if (!PUBLIC_ID) {
      throw new Error('FlowAPI: Missing data-public-id on script tag.');
    }
    if (!url) {
      throw new Error('FlowAPI: request({ url }) is required.');
    }
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Flow-Public-Id': PUBLIC_ID,
      },
      body: JSON.stringify({ url, method, headers, body }),
    });
    if (!res.ok) {
      const text = await res.text().catch(()=> '');
      throw new Error('FlowAPI proxy failed: ' + text);
    }
    // The proxy should return the upstream response body
    return res.json().catch(() => null);
  }

  window.FlowAPI = {
    request,
    getPublicId: () => PUBLIC_ID,
    version: '0.1.0'
  };

  if (!PUBLIC_ID) {
    console.warn('FlowAPI: data-public-id not provided on sdk.js script tag.');
  }
})();


