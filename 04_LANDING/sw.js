/* VEXOcar · service worker.
   Existe para o celular oferecer "Instalar app" (ícone na tela inicial, abre em tela cheia).
   Não guarda nada para usar sem internet (decisão de 04/11/2026: sem modo offline):
   as telas sempre vêm da rede. Pedidos de outros sites (API, Firebase, Cloudinary, fontes) passam direto. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.mode !== 'navigate' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).catch(function () {
    return new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>VEXOcar · sem internet</title>' +
      '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0E0F11;color:#F2F1EC;' +
      'font-family:system-ui,sans-serif;text-align:center;padding:24px">' +
      '<div><p style="font-size:20px;font-weight:700;margin:0 0 8px">Sem internet</p>' +
      '<p style="color:#8A8F98;margin:0 0 20px">O VEXOcar precisa de conexão. Confira o Wi-Fi ou os dados móveis.</p>' +
      '<a href="" style="color:#2FD47A;font-weight:600">Tentar de novo</a></div>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }));
});
