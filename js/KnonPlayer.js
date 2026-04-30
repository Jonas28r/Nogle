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

            const schemaItems = [];
            const modelName = this.formatName(this.currentModel);
            
            // Extraer la primera imagen para usarla como portada dinámica al compartir el link
            const firstImageSrc = data.items.find(i => i.type === 'image')?.src || 'https://nogle.vercel.app/logo-nogle.png';

            data.items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'media-item';

                if (item.type === 'image') {
                    div.innerHTML = `
                        <img src="${item.src}" loading="lazy" crossorigin="anonymous" alt="${modelName} - Contenido exclusivo Nogle">
                        <div class="watermark">NOGLE</div>
                    `;
                    
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
                    const posterUrl = item.poster || 'default-poster.webp';
                    
                    div.innerHTML = `
                        <video src="${item.src}" preload="none" poster="${posterUrl}" crossorigin="anonymous" controls playsinline></video>
                        <div class="watermark">NOGLE</div>
                    `;

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

            // Inyectamos todo el SEO dinámico (Schema, Canonical y Open Graph)
            this.injectSEO(schemaItems, modelName, firstImageSrc);

            this.initObserver();

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">Error de conexión con Knon Ecosystem.</p>';
        }
    },

    injectSEO(schemaItems, modelName, firstImageSrc) {
        // 1. Inyección de JSON-LD (Schema.org)
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
        
        // 2. Título de la pestaña
        document.title = `${modelName} | NOGLE Premium`;

        // 3. Etiqueta Canonical Dinámica
        const canonicalUrl = `https://nogle.vercel.app/visor?m=${this.currentModel}`;
        const canonicalTag = document.createElement('link');
        canonicalTag.rel = 'canonical';
        canonicalTag.href = canonicalUrl;
        document.head.appendChild(canonicalTag);

        // 4. Inyección de Open Graph y Twitter Cards Dinámicos
        const metaTags = [
            { property: 'og:title', content: `${modelName} | NOGLE Premium` },
            { property: 'og:description', content: `Contenido multimedia exclusivo de ${modelName}. Acceso premium.` },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: canonicalUrl },
            { property: 'og:image', content: firstImageSrc },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: `${modelName} | NOGLE Premium` },
            { name: 'twitter:description', content: `Contenido multimedia exclusivo de ${modelName}.` },
            { name: 'twitter:image', content: firstImageSrc }
        ];

        metaTags.forEach(tagData => {
            const meta = document.createElement('meta');
            if (tagData.property) meta.setAttribute('property', tagData.property);
            if (tagData.name) meta.setAttribute('name', tagData.name);
            meta.setAttribute('content', tagData.content);
            document.head.appendChild(meta);
        });
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
