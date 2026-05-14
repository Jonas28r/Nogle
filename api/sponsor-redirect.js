export default function handler(req, res) {
  // Tu enlace limpio de Adsterra
  const adsterraUrl = "https://skinnycrawlinglax.com/h4bpbppz?key=489fd23120820292cb2f5bba04598957";
  
  // Vercel ejecuta la redirección silenciosa 302 desde el servidor
  res.redirect(302, adsterraUrl);
}
