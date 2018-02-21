'use strict'

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
    mode: event.request.mode,
    method: event.request.method
  })
  if (event.request.mode === 'navigate' || (
    event.request.method === 'GET' && 
    event.request.headers.get('accept').includes('text/html')
  )) {
    event.respondWith(
      fetch(event.request.url).catch(function(error) {
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
          })
        })
      })
    )
  }
})
