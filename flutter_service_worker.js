'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "index.html": "14bc5aa236e998bcd3f07f94d28f0989",
"/": "14bc5aa236e998bcd3f07f94d28f0989",
"main.dart.js": "481e97e9e470ffd119768c7e1a3de249",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "25ecaf2ff8100d3aef417c78b2e8bdb6",
"assets/AssetManifest.json": "2d968bd76a62571e9026decdf2508102",
"assets/NOTICES": "0cb42d8a0a92cb32ec8aa7bba92656cf",
"assets/FontManifest.json": "b00f616d2a06ee6b7670caee5fd08cc4",
"assets/packages/groovin_material_icons/fonts/pub_icon.ttf": "5cc207051c36749d5e7d09b8446bb4f2",
"assets/packages/groovin_material_icons/fonts/MaterialOutlineIcons1.ttf": "0f2e93ecc4eeeb0af5166b6c3dbd123c",
"assets/packages/groovin_material_icons/fonts/flutter_icon_custom.ttf": "d86777a6da8c9be38f78f0dd55b72696",
"assets/packages/groovin_material_icons/fonts/send_outline.ttf": "1584ea472bff01b3a03d71334b7fb9da",
"assets/packages/groovin_material_icons/fonts/ballot_icons.ttf": "8e72d4116a540a3fd12a3147c9f61bbc",
"assets/packages/groovin_material_icons/fonts/materialdesignicons-webfont.ttf": "c1971be827467e11eafafa657a7978bf",
"assets/packages/groovin_material_icons/assets/flutter.png": "3ed5fdc99539ba8e4593e4d86255fe67",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "2aa350bd2aeab88b601a593f793734c0",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "2bca5ec802e40d3f4b60343e346cedde",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "5a37ae808cf9f652198acde612b5328d",
"assets/packages/humanitarian_icons/fonts/Humanitarian-Icons-v02.ttf": "d78c6eb57c26e8732cd1a447f10d52f8",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/assets/host_3.jpeg": "3bcda88b0e8251fca145af504b95dbf2",
"assets/assets/404.png": "6555ac06bae6fb2daeb0a5389e396b77",
"assets/assets/host_2.jpeg": "ac70cc6a89f4e355943be7cd560bfade",
"assets/assets/Loading.flr": "3a2e6a812628d40631d302c53c476e69",
"assets/assets/host_5.jpeg": "2647f0d6080d90e22ad90b478b484ea0",
"assets/assets/host_9.jpeg": "12fb07b959a263754ea332c1d88806cc",
"assets/assets/host.jpeg": "325d121489cfaaeb2cfda75c58440434",
"assets/assets/host_8.jpeg": "e915df6a04da9f4210afd384f0f591e3",
"assets/assets/host_4.jpeg": "a16282217ac99a333e26ad9da4486b3d",
"assets/assets/host_7.jpeg": "440209e42cc619cf3cad32d77320cd79",
"assets/assets/profile_view.png": "0076adaf5ce387504346f616ec473e6f",
"assets/assets/host_6.jpeg": "67acb456d4423876daa98c68e71ba09e",
"assets/assets/Check.flr": "1ccf36e35d4f5393156eb7ed3e6ee42e",
"assets/assets/fonts/Quicksand-Medium.ttf": "7e2479fe3619b4b56dbfc0094ff23a3c"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/LICENSE",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      // Provide a no-cache param to ensure the latest version is downloaded.
      return cache.addAll(CORE.map((value) => new Request(value, {'cache': 'no-cache'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');

      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }

      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#')) {
    key = '/';
  }
  // If the URL is not the the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache. Ensure the resources are not cached
        // by the browser for longer than the service worker expects.
        var modifiedRequest = new Request(event.request, {'cache': 'no-cache'});
        return response || fetch(modifiedRequest).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.message == 'skipWaiting') {
    return self.skipWaiting();
  }

  if (event.message = 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.add(resourceKey);
    }
  }
  return Cache.addAll(resources);
}
