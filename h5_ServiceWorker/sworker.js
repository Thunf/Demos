'use strict';

var cacheScope = location.origin
var cacheScopeName = cacheScope + ' - version:' + Math.random().toString(36).substr(2)

this.addEventListener('install', function(event) {
  console.warn('-- install -->')
  event.waitUntil(
    caches.open(cacheScopeName).then(function(cache) {
      return cache.addAll(['./offline.html', './offline.svg'])
    }).then(this.skipWaiting())
  )
})

this.addEventListener('activate', function(event) {
  console.warn('-- activate -->')
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(cacheName) {
        if (cacheName !== cacheScopeName && cacheName.indexOf(cacheScope) === 0) {
          console.warn('[caches.delete]', cacheName)
          return caches.delete(cacheName)
        }
      }))
    })
  )
})

this.addEventListener('fetch', function(event) {
  console.warn('-- fetch -->')
  console.table({
    url: event.request.url,
    mode: event.request.mode,
    method: event.request.method
  })
  if (event.request.mode === 'navigate' || (
    event.request.method === 'GET' && 
    event.request.headers.get('accept').includes('text/html')
  )) {
    event.respondWith(
      fetch(event.request.url).then(function(res) {
        // devtools' offline don't work
        // because github "cache-control" & "expires"
        var headers = {}
        res.headers.forEach(function(val, key) {headers[key] = val})

        // make text/html uncached
        var fixRes = new Response(res.body, Object.assign({}, res, {
          headers: Object.assign(headers, {
            'cache-control': 'public, max-age=0',
            'cache-control-origin': headers['cache-control'] || '',
            'expires': '',
            'expires-origin': headers['expires'] || '',
          })
        }))

        console.warn('[fetch the page success], without cache')
        return fixRes
      }).catch(function(error) {
        console.error('[fetch page error] show offline, ', error)
        // Return the offline page
        return caches.match('./offline.html')
      })
    )
  } else{
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || caches.open(cacheScopeName).then(function(cache) {
          return fetch(event.request).then(function(res) {
            return res.status === 200 ? cache.put(event.request.url, res.clone()).then(function() {
              return res
            }) : res
          }).catch(function(error) {
            console.error('[fetch error]', error)
            return caches.match('./offline.svg')
          })
        })
      })
    )
  }
})
