/* =========================================
   KNON PLAYER V1.1 - R2 CONNECTED (SEO OPTIMIZED)
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    observer: null,
    WORKER_URL: 'https://nogle-knon.villajonas09.workers.dev/',
    
    init() {
        const params = new URLSearchParams(window.location.search);
        this.currentModel = params.get('m'); 
        
        if(this.currentModel) {
            this.loadContent();
        } else {
            document.getElementById('gallery-container').innerHTML = '<p style="color:white; text-align:center; padding:50px;">Modelo no encontrada.</p>';
        }
    },

    // Función auxiliar para capitalizar nombres en el SEO
    formatName(name) {
        return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Modelo';
    },

    async loadContent() {
        const container = document.getElementById('gallery-container');
        
        try {
            const response = await fetch(`${this.WORKER_URL}galeria.json?m=${this.currentModel}`);
            const data = await response.json();

            if (data.items.length === 0) {
                container.innerHTML = '<p style="color:#555; text-align:center; padding:50px;">No hay contenido publicado aún.</p>';
                return;
            }

            // Array para almacenar los datos estructurados dinámicamente
            const schemaItems = [];
            const modelName = this.formatName(this.currentModel);

            data.items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'media-item';

                if (item.type === 'image') {
                    // Atributo 'alt' dinámico para indexación de palabras clave
                    div.innerHTML = `
                        <img src="${item.src}" loading="lazy" crossorigin="anonymous" alt="${modelName} - Contenido exclusivo Nogle">
                        <div class="watermark">NOGLE</div>
                    `;
                    
                    // Construimos el schema para esta imagen
                    schemaItems.push({
                        "@type": "ImageObject",
                        "contentUrl": item.src,
                        "name": `Fotografía exclusiva de ${modelName}`,
                        "creator": {
                            "@type": "Person",
                            "name": modelName
                        }
                    });

                } else if (item.type === 'video') {
                    // Lógica híbrida preparada para SEO y rendimiento
                    // preload="none" evita descargar el video hasta que el usuario le da play
                    // el poster en WebP es vital para los Core Web Vitals
                    const posterUrl = item.poster || 'default-poster.webp';
                    
                    div.innerHTML = `
                        <video src="${item.src}" preload="none" poster="${posterUrl}" crossorigin="anonymous" controls playsinline></video>
                        <div class="watermark">NOGLE</div>
                    `;

                    // Construimos el schema estricto para video adulto
                    schemaItems.push({
                        "@type": "VideoObject",
                        "name": `Vídeo exclusivo de ${modelName}`,
                        "description": item.description || `Escena multimedia premium de ${modelName}.`,
                        "thumbnailUrl": [posterUrl],
                        "uploadDate": item.date || new Date().toISOString(),
                        "contentUrl": item.src,
                        "isFamilyFriendly": "False"
                    });
                }
                
                container.appendChild(div);
            });

            // Inyectamos los metadatos JSON-LD estructurados en el Head
            this.injectSEO(schemaItems, modelName);

            this.initObserver();

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">Error de conexión con Knon Ecosystem.</p>';
        }
    },

    injectSEO(schemaItems, modelName) {
        // Creamos la galería global que engloba todas las fotos y vídeos
        const schema = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `Galería premium de ${modelName} - NOGLE`,
            "isFamilyFriendly": "False",
            "hasPart": schemaItems
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
        
        // Actualizamos el título de la pestaña dinámicamente
        document.title = `${modelName} | NOGLE Premium`;
    },

    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            // Lógica de RAM intacta para el futuro cuando metas videos
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    // Manejo de carga de video/autoplay diferido
                }
            });
        }, { threshold: 0.5 });
    }
};

KnonPlayer.init();
