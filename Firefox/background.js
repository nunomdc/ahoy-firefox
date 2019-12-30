// Initialize the ahoy
var ahoy = new Ahoy();

var blockedHosts = [];
var proxyAddress = { host: "", port: "" };

/**
 * auxiliar functions
 */
function parseVersionString (str) {
  if (typeof(str) != "string") { return false; }
  var x = str.split(".");
  // parse from string or default to 0 if can't parse
  var maj = parseInt(x[0]) || 0;
  var min = parseInt(x[1]) || 0;
  var pat = parseInt(x[2]) || 0;

  return {
      major: maj,
      minor: min,
      patch: pat
  }
}

/**
 * Alarms - Periodic Tasks
 * Updating the Local Storage with the latest info
 */

// Create the periodic alarm to fetch new sites
browser.alarms.create( "update_sites_and_proxy", { delayInMinutes: 30, periodInMinutes: 30 } );

// Handle the alarms
browser.alarms.onAlarm.addListener( function (alarm) {
	if (alarm.name == "update_sites_and_proxy") {
		ahoy.update_site_list();
		ahoy.update_proxy();
	}
});

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});

// Initialize the proxy
// update the proxy whenever stored settings change
browser.storage.onChanged.addListener((newSettings) => {
  if (newSettings.sites_list) {
    blockedHosts = newSettings.sites_list.newValue;
  }
  if (newSettings.proxy_addr) {
    proxyAddress.host = newSettings.proxy_addr.newValue.host;
    proxyAddress.port = newSettings.proxy_addr.newValue.port;
  }
});

// get the current settings, then...
browser.storage.local.get()
  .then((storedSettings) => {
    // if there are stored settings, update the proxy with them...
    if (storedSettings.sites_list && storedSettings.proxy_addr) {
      blockedHosts = storedSettings.sites_list;
      proxyAddress = storedSettings.proxy_addr;
    // ...otherwise, initialize storage with the default values
    } else {
      blockedHosts = ahoy.sites_list;
      proxyAddress = ahoy.proxy_addr;
      browser.storage.local.set({
        sites_list: blockedHosts,
        proxy_addr: proxyAddress
      });
    }
  })
  .catch(()=> {
    console.log("Error retrieving stored settings");
  });

browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });

// required PAC function that will be called to determine
// if a proxy should be used.
function handleProxyRequest(requestInfo) {
	const url = new URL(requestInfo.url);

	if (blockedHosts.indexOf(url.hostname) != -1) {
		console.log("Returning proxy host = " + proxyAddress.host + " port = " + proxyAddress.port);
		return { type: "http", host: proxyAddress.host, port: proxyAddress.port };
  }
	return { type: "direct" };
}
