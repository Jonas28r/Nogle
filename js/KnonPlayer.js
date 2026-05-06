/* =========================================
   KNON PLAYER V1.2 - R2 CONNECTED (SEO ADVANCED)
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

    // ACTUALIZACIÓN: Formateo perfecto para eliminar guiones y poner mayúsculas iniciales
    formatName(slug) {
        if (!slug) return 'Modelo';
        return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

            const schemaItems = [];
            const modelName = this.formatName(this.currentModel);
            
            // Extraer la primera imagen para usarla como portada dinámica al compartir el link
            const firstImageSrc = data.items.find(i => i.type === 'image')?.src || 'https://nogle.vercel.app/logo-nogle.png';

            // ACTUALIZACIÓN: Uso del index para crear texto único por cada imagen/video
            data.items.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'media-item';

                if (item.type === 'image') {
                    div.innerHTML = `
                        <img src="${item.src}" loading="lazy" crossorigin="anonymous" alt="Foto ${index + 1} de ${modelName} - Contenido exclusivo premium">
                        <div class="watermark">NOGLE</div>
                    `;
                    
                    schemaItems.push({
                        "@type": "ImageObject",
                        "contentUrl": item.src,
                        "name": `Fotografía premium ${index + 1} de ${modelName}`,
                        "creator": {
                            "@type": "Person",
                            "name": modelName
                        }
                    });

                } else if (item.type === 'video') {
                    const posterUrl = item.poster || 'default-poster.webp';
                    
                    div.innerHTML = `
                        <video src="${item.src}" preload="none" poster="${posterUrl}" crossorigin="anonymous" controls playsinline></video>
                        <div class="watermark">NOGLE</div>
                    `;

                    schemaItems.push({
                        "@type": "VideoObject",
                        "name": `Vídeo exclusivo ${index + 1} de ${modelName}`,
                        "description": item.description || `Escena multimedia premium número ${index + 1} de ${modelName} en alta definición.`,
                        "thumbnailUrl": [posterUrl],
                        "uploadDate": item.date || new Date().toISOString(),
                        "contentUrl": item.src,
                        "isFamilyFriendly": "False"
                    });
                }
                
                container.appendChild(div);
            });

            // Inyectamos todo el SEO dinámico (Schema, y actualización de Open Graph)
            this.injectSEO(schemaItems, modelName, firstImageSrc);

            this.initObserver();

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">Error de conexión con Knon Ecosystem.</p>';
        }
    },

    injectSEO(schemaItems, modelName, firstImageSrc) {
        // 1. Inyección de JSON-LD (Schema.org) para los items individuales
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
        
        // 2. ACTUALIZACIÓN: Función auxiliar inteligente para actualizar etiquetas sin duplicarlas
        const updateMeta = (attributeName, attributeValue, contentValue) => {
            let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attributeName, attributeValue);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', contentValue);
        };

        // 3. Actualización de Open Graph y Twitter Cards Dinámicos con la imagen real de la base de datos
        updateMeta('property', 'og:title', `${modelName} | NOGLE Premium`);
        updateMeta('property', 'og:description', `Contenido multimedia exclusivo de ${modelName}. Acceso premium.`);
        updateMeta('property', 'og:image', firstImageSrc);
        
        updateMeta('name', 'twitter:title', `${modelName} | NOGLE Premium`);
        updateMeta('name', 'twitter:description', `Galería premium de fotos y videos exclusivos de ${modelName}.`);
        updateMeta('name', 'twitter:image', firstImageSrc);
    },

    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    // Manejo futuro de carga de video/autoplay diferido
                }
            });
        }, { threshold: 0.5 });
    }
};

KnonPlayer.init();
