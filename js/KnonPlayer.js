/* =========================================
   KNON PLAYER V1.0 - NOGLE EDITION
   Reproductor Híbrido y Optimizador de RAM
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    observer: null,
    
    init() {
        // 1. Detectar qué modelo se tocó en la portada
        const params = new URLSearchParams(window.location.search);
        this.currentModel = params.get('m') || 'default';
        
        this.loadContent();
    },

    async loadContent() {
        const container = document.getElementById('gallery-container');
        
        /* Fase 1: Simulación de la Base de Datos.
           El fin de semana reemplazaremos este bloque con un 'fetch' a tu Cloudflare Worker.
        */
        const response = {
            items: [
                { type: 'image', src: 'https://via.placeholder.com/600x800/111/fff?text=Fotografia+Premium+1' },
                { type: 'hybrid', webp: 'https://via.placeholder.com/600x800/222/fff?text=WebP+Carnada', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                { type: 'image', src: 'https://via.placeholder.com/600x800/333/fff?text=Fotografia+Premium+2' }
            ],
            hasMore: false // El Worker nos dirá si hay más contenido
        };

        // 2. Dibujar el lienzo (Inyectando HTML dinámico)
        response.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'media-item';

            if (item.type === 'image') {
                // Renderizado de foto normal
                div.innerHTML = `
                    <img src="${item.src}" loading="lazy" alt="Nogle Exclusive">
                    <div class="watermark">NOGLE</div>
                `;
            } else if (item.type === 'hybrid') {
                // Renderizado de la trampa híbrida (WebP encima, Video oculto abajo)
                div.innerHTML = `
                    <div class="media-wrapper" data-video="${item.video}" style="position:relative; width:100%; aspect-ratio:3/4; background:#000;">
                        <img src="${item.webp}" class="webp-layer" loading="lazy" style="position:absolute; width:100%; height:100%; object-fit:cover; z-index:2; transition: opacity 0.5s;">
                        <div class="watermark">NOGLE</div>
                    </div>
                `;
            }
            container.appendChild(div);
        });

        // 3. Lógica del botón siguiente inteligente
        if(response.hasMore) {
            document.getElementById('btn-next').style.display = 'block';
        }

        // 4. Encender el radar de RAM
        this.initObserver();
    },

    // =========================================
    // EL MOTOR DE AUTODESTRUCCIÓN
    // =========================================
    initObserver() {
        // Configuramos el radar: se activa cuando el 50% de la caja está en pantalla
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const wrapper = entry.target;
                const videoSrc = wrapper.dataset.video;

                if (entry.isIntersecting) {
                    // EL VIDEO ENTRA EN PANTALLA: Nace el MP4
                    let video = wrapper.querySelector('video');
                    if (!video) {
                        video = document.createElement('video');
                        video.className = 'video-layer';
                        video.src = videoSrc;
                        video.muted = true; 
                        video.loop = true; 
                        video.playsInline = true; // Crucial para que no se abra en pantalla completa en iOS
                        video.style.cssText = 'position:absolute; width:100%; height:100%; object-fit:cover; z-index:1; opacity:0; transition: opacity 0.5s;';

                        // Cuando el video arranca, desaparecemos el WebP suavemente
                        video.onplaying = () => {
                            wrapper.querySelector('.webp-layer').style.opacity = '0';
                            video.style.opacity = '1';
                        };
                        wrapper.appendChild(video);
                    }
                    // Le damos play forzado
                    video.play().catch(() => {
                        // Manejo de errores silencioso si el navegador bloquea el autoplay
                    });

                } else {
                    // EL VIDEO SALE DE PANTALLA: Asesinato de RAM
                    const video = wrapper.querySelector('video');
                    if (video) {
                        video.pause(); // Detenemos la reproducción
                        video.removeAttribute('src'); // Rompemos el enlace
                        video.load(); // Vaciamos el buffer del navegador
                        video.remove(); // Eliminamos la etiqueta HTML
                        
                        // Hacemos que el WebP vuelva a aparecer
                        wrapper.querySelector('.webp-layer').style.opacity = '1';
                    }
                }
            });
        }, { threshold: 0.5 });

        // Enganchar el radar solo a las cajas que tienen videos híbridos
        document.querySelectorAll('.media-wrapper').forEach(w => this.observer.observe(w));
    }
};

// Encender la máquina al cargar el archivo
KnonPlayer.init();

// Función en espera para el botón de cargar más
function loadMore() {
    alert("Próximamente: Conectando con Cloudflare Worker...");
}
