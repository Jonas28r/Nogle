/* =========================================
   KNON PLAYER - CORE LOGIC
   ========================================= */

// 1. EL MOLDE: JSON Simulado (Para probar la estructura Híbrida)
const mockData = {
    creator: "María VIP",
    conversion_link: "https://onlyfans.com/ejemplo",
    items: [
        { id: 1, type: "image", src: "https://via.placeholder.com/600x900/222/fff?text=Foto+Estática+1" },
        { 
            id: 2, 
            type: "hybrid", 
            videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4", 
            webpSrc: "https://via.placeholder.com/600x900/111/fff?text=Animacion+WebP+1" 
        },
        { id: 3, type: "image", src: "https://via.placeholder.com/600x1200/222/fff?text=Foto+Estática+2+(Larga)" },
        { 
            id: 4, 
            type: "hybrid", 
            videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4", 
            webpSrc: "https://via.placeholder.com/600x900/111/fff?text=Animacion+WebP+2" 
        }
    ]
};

const container = document.getElementById('gallery-container');

// 2. EL CEREBRO: Observador de Foco y Autodestrucción
const hybridObserverOptions = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.6 // El 60% del wrapper debe estar visible
};

const hybridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const wrapper = entry.target;
        // Recuperamos la URL del video original que guardamos en el dataset del wrapper
        const videoSrc = wrapper.dataset.videoSrc; 

        if (entry.isIntersecting) {
            // ==========================================
            // FASE 1 y 3: RECONSTRUCCIÓN Y REPRODUCCIÓN
            // ==========================================
            let video = wrapper.querySelector('video');
            
            // Si el video no existe (fue autodestruido), lo volvemos a crear mágicamente
            if (!video) {
                video = document.createElement('video');
                video.className = 'video-layer';
                video.src = videoSrc;
                video.muted = true; // Vital para el autoplay
                video.loop = true;
                video.playsInline = true;

                // FASE 2: TRANSICIÓN WEBP -> VIDEO ("El Pumm")
                // Solo cuando el video ya tiene datos y empieza a rodar, hacemos el cambio visual
                video.addEventListener('playing', () => {
                    wrapper.classList.add('video-ready');
                });

                // UX: Tocar para mutear/desmutear
                video.addEventListener('click', () => {
                    video.muted = !video.muted;
                });

                // Inyectamos el video al DOM
                wrapper.appendChild(video);
            }
            
            // Le damos Play. Usamos .catch para evitar errores en consola si el navegador es muy estricto
            video.play().catch(error => {
                console.log("Autoplay requiere interacción previa del usuario:", error);
            });

        } else {
            // ==========================================
            // FASE 3: LA AUTODESTRUCCIÓN (Ahorro Extremo)
            // ==========================================
            const video = wrapper.querySelector('video');
            
            if (video) {
                video.pause();
                video.removeAttribute('src'); // Desconecta el flujo de datos de la red
                video.load(); // Fuerza al navegador a liberar la memoria RAM de este archivo
                video.remove(); // Destruye el elemento HTML por completo
            }
            
            // Quitamos la clase 'video-ready' para que el WebP (Señuelo) vuelva a ser visible 
            // cuando el usuario haga scroll de regreso.
            wrapper.classList.remove('video-ready');
        }
    });
}, hybridObserverOptions);

// 3. EL CONSTRUCTOR: Renderiza el HTML inicial
function renderGallery(data) {
    data.items.forEach(item => {
        if (item.type === 'image') {
            // Renderizado de foto normal
            const img = document.createElement('img');
            img.src = item.src;
            img.className = 'media-item';
            img.loading = "lazy";
            container.appendChild(img);
            
        } else if (item.type === 'hybrid') {
            // Renderizado de nuestra estructura Knon Híbrida
            const wrapper = document.createElement('div');
            wrapper.className = 'media-wrapper';
            // Guardamos la ruta del video crudo escondida en el HTML
            wrapper.dataset.videoSrc = item.videoSrc; 

            // Creamos el Señuelo (WebP)
            const webp = document.createElement('img');
            webp.src = item.webpSrc;
            webp.className = 'webp-layer';
            webp.loading = "lazy"; // Que el señuelo tampoco gaste datos si está muy lejos

            // Metemos el señuelo en el molde y el molde al contenedor principal
            wrapper.appendChild(webp);
            container.appendChild(wrapper);

            // IMPORTANTE: Le ponemos el ojo al molde, no al video.
            hybridObserver.observe(wrapper);
        }
    });

    // Añadir la Knon Conversion Card al final
    const endCard = document.createElement('div');
    endCard.className = 'conversion-card';
    endCard.innerHTML = `
        <h2>¿Te gustó el contenido de ${data.creator}?</h2>
        <p>Desbloquea la galería completa y videos sin censura.</p>
        <a href="${data.conversion_link}" class="btn-premium">Suscríbete ahora</a>
    `;
    container.appendChild(endCard);

    // Añadir la firma Knon al final de todo
    const footer = document.createElement('div');
    footer.className = 'knon-footer';
    footer.innerHTML = `Architecture by <span>Knon Ecosystem</span>`;
    container.appendChild(footer);
}

// Iniciar el catálogo
renderGallery(mockData);

