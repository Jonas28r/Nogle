export default function handler(req, res) {
  // Tu enlace de Adsterra
  const adsterraUrl = "https://skinnycrawlinglax.com/h4bpbppz?key=489fd23120820292cb2f5bba04598957";
  
  // Redirección silenciosa 302
  res.redirect(302, adsterraUrl);
}
