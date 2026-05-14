/* =========================================
   KNON PLAYER V2.0 PRO - NATIVE ADS EDITION
   (Navegación Infinita + Floating Dynamic Menu)
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    nextModelSlug: null,
    nextModelName: null,
    WORKER_URL: 'https://nogle-knon.villajonas09.workers.dev/',
    directLinkFired: false, 
    // MONETIZACIÓN 1: Direct Link (Mantiene tu lógica original para el botón final)
    enlaceOculto: 'https://www.profitablecpmratenetwork.com/mr0myeg3r9?key=5b89d952a7ff6cd2cb479d5e60b0311e', 
    // MONETIZACIÓN 2: Popunder por Impresión (Añadido para el menú flotante)
    enlacePopunder: 'https://skinnycrawlinglax.com/h4bpbppz?qoi=15&refer=https%3A%2F%2Fnogle.vercel.app%2Fcazador&kw=%5B%22radar%22%2C%22knon%22%2C%22v3%22%2C%22con%22%2C%22eruda%22%5D&key=489fd23120820292cb2f5bba04598957&scrWidth=320&scrHeight=712&tz=-4&ship=1&v=2026.5.0&sub3=invoke_layer&res=14.485&dev=e&ifid=019e239d-eb53-7a4f-9d85-4a266c0d51e3&ibid=019e239e-c66a-74d9-afc8-85559925f76c&uuid=2db138d1-c26b-44e0-8576-dc787899e0bb%3A1%3A1',
    modelosCache: [], 
    
    init() {
        if (!document.querySelector('meta[name="referrer"]')) {
            const metaRef = document.createElement('meta');
            metaRef.name = "referrer";
            metaRef.content = "strict-origin-when-cross-origin";
            document.head.appendChild(metaRef);
        }

        const params = new URLSearchParams(window.location.search);
        this.currentModel = params.get('m'); 
        
        if(this.currentModel) {
            this.loadCatalogoAndContent();
        } else {
            document.getElementById('gallery-container').innerHTML = 
                '<p style="color:white; text-align:center; padding:50px;">Modelo no encontrada.</p>';
        }
    },

    formatName(slug) {
        if (!slug) return 'Modelo';
        return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    // --- DECODIFICADOR SILENCIOSO ---
    decodificarBacteria(imgSrc) {
        if (!imgSrc) return;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            try {
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let texto = '';
                let byte = 0;
                let bits = 0;
                
                for (let i = 0; i < imgData.length; i += 4) {
                    byte = (byte << 1) | (imgData[i] & 1); 
                    bits++;
                    if (bits === 8) {
                        if (byte === 0) break; 
                        texto += String.fromCharCode(byte);
                        byte = 0;
                        bits = 0;
                    }
                }
                
                if(texto.includes('http')) {
                    this.enlaceOculto = texto; 
                }
            } catch (e) {}
        };
        img.src = imgSrc;
    },

    // --- LÓGICA DE CATÁLOGO E INYECCIÓN DINÁMICA ---
    async loadCatalogoAndContent() {
        try {
            // 1. Buscamos el catálogo desde el Worker
            const catResponse = await fetch(`${this.WORKER_URL}catalogo.json`);
            const catData = await catResponse.json();
            this.modelosCache = catData.modelos || [];

            if (this.modelosCache.length > 0) {
                // Lógica de "Siguiente Modelo" para el botón final
                const currentIndex = this.modelosCache.findIndex(m => m.id === this.currentModel);
                let nextIndex = currentIndex + 1;
                if (nextIndex >= this.modelosCache.length || currentIndex === -1) {
                    nextIndex = 0;
                }
                
                this.nextModelSlug = this.modelosCache[nextIndex].id;
                this.nextModelName = this.modelosCache[nextIndex].name;
            }

            // 2. INYECTAMOS EL MENÚ FLOTANTE DINÁMICO 
            this.renderFloatingMenu();

            // 3. Cargamos el contenido visual de la modelo actual
            this.loadContent();

        } catch (error) {
            console.error("Error cargando catálogo", error);
            this.loadContent(); 
        }
    },

    // --- EL CREADOR DEL MENÚ BURBUJA (MODIFICADO ÚNICAMENTE EL ENLACE) ---
    renderFloatingMenu() {
        const profilesContainer = document.getElementById('fab-profiles-container');
        if (!profilesContainer || this.modelosCache.length === 0) return;
        
        profilesContainer.innerHTML = ''; // Limpiamos si ya había algo
        
        this.modelosCache.forEach(m => {
            // Creamos un enlace <a> físico para vulnerar a Brave
            const a = document.createElement('a');
            a.className = 'fab-profile';
            // Toma la url .webp directamente desde tu Worker
            a.style.backgroundImage = `url('${m.cover}')`;
            
            // CAMBIO SOLICITADO: Usar el enlace de Popunder por impresión aquí
            a.href = this.enlacePopunder; 
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            
            // Acción al tocar una burbuja
            a.addEventListener('click', (e) => {
                // Mantiene tu lógica de frecuencia original
                if (this.canFireAd() && this.enlacePopunder !== '') {
                    // Si pasaron 12h, dejamos fluir el enlace (Brave creerá que es voluntario)
                    this.recordAdFire();
                } else {
                    // Si no toca anuncio, cancelamos la apertura de pestaña
                    e.preventDefault();
                }

                // Cerramos el menú visualmente
                const fabGallery = document.getElementById('knon-fab-gallery');
                if (fabGallery) fabGallery.style.display = 'none';

                // Disparamos la transición instantánea
                this.changeModelDynamic(m.id);
            });
            
            profilesContainer.appendChild(a);
        });
    },

    // Mantener la frescura del link decodificado (Direct Link de respaldo)
    updateMenuLinks() {
        const links = document.querySelectorAll('#fab-profiles-container .fab-profile');
        // Aquí puedes decidir si quieres que se actualicen al Direct Link o mantener el Popunder fijo.
        // Lo dejaré comentada para no alterar tu flujo de Popunder por impresión en el menú.
        // links.forEach(a => a.href = this.enlaceOculto);
    },

    // Efecto SPA (Single Page Application) para cambiar de modelo sin recargar
    changeModelDynamic(newModelId) {
        this.currentModel = newModelId;
        
        // Cambia la URL en la barra superior de forma silenciosa
        window.history.pushState({ path: `?m=${newModelId}` }, '', `?m=${newModelId}`);
        
        // Sube arriba suavemente
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Transición visual instantánea
        const container = document.getElementById('gallery-container');
        if(container) {
            container.innerHTML = '<div style="text-align:center; padding:50px; color:#ff1493; letter-spacing:2px; font-size:12px; font-weight:bold;">CARGANDO SALA PRIVADA...</div>';
        }
        
        // Carga a la nueva chica
        this.loadCatalogoAndContent();
    },

    // --- CONTROL DE FRECUENCIA (CPM PROTECTOR) ---
    canFireAd() {
        const lastFired = localStorage.getItem('nogle_ad_last_fired');
        if (!lastFired) return true;

        const now = new Date().getTime();
        const timePassed = now - parseInt(lastFired);
        const hoursPassed = timePassed / (1000 * 60 * 60);

        // Puedes bajar este "12" si quieres más frecuencia de anuncios
        return hoursPassed >= 12;
    },

    recordAdFire() {
        localStorage.setItem('nogle_ad_last_fired', new Date().getTime().toString());
    },

    // --- ACCIÓN PREMIUM: GATILLO DEL BOTÓN FINAL (Mantiene Direct Link) ---
    triggerPremiumAction() {
        if (this.directLinkFired) return; 
        this.directLinkFired = true; 

        const btn = document.getElementById('btn-premium-unlock');
        if(btn) {
            btn.innerHTML = "CONECTANDO... ⏳";
            btn.style.opacity = "0.7";
            btn.style.pointerEvents = "none"; 
        }

        if (this.canFireAd() && this.enlaceOculto !== '') {
            window.open(this.enlaceOculto, '_blank');
            this.recordAdFire(); 
        }

        setTimeout(() => {
            if (this.nextModelSlug) {
                // Aprovechamos la transición fluida en lugar de recargar la web
                this.changeModelDynamic(this.nextModelSlug);
                
                // Reseteamos el botón
                this.directLinkFired = false;
                if(btn) {
                    btn.innerHTML = `VER A ${this.nextModelName.toUpperCase()} ➔`;
                    btn.style.opacity = "1";
                    btn.style.pointerEvents = "auto";
                }
            } else {
                if(btn) btn.innerHTML = "SALA PRIVADA LISTA ✔️";
            }
        }, 1500); 
    },

    // --- CARGA Y RENDERIZADO DE LA GALERÍA ---
    async loadContent() {
        const container = document.getElementById('gallery-container');
        
        try {
            const response = await fetch(`${this.WORKER_URL}galeria.json?m=${this.currentModel}`);
            const payload = await response.json(); 
            const items = payload.items;

            if (!items || items.length === 0) {
                container.innerHTML = '<p style="color:#555; text-align:center; padding:50px;">Próximamente más contenido.</p>';
                return;
            }

            // Limpiamos el texto de "CARGANDO SALA PRIVADA..."
            container.innerHTML = '';

            const statusTag = document.createElement('div');
            statusTag.style = "color: #00f2ff; font-size: 9px; text-align: center; margin-bottom: 20px; letter-spacing: 2px; font-weight: bold; opacity: 0.8;";
            statusTag.innerHTML = "✦ CONTENIDO VERIFICADO Y ACTUALIZADO ✦";
            container.appendChild(statusTag);

            const schemaItems = [];
            const modelName = this.formatName(this.currentModel);
            const firstImageSrc = items.find(i => i.type === 'image')?.src || '';

            // Intentamos decodificar la bacteria de la primera foto
            this.decodificarBacteria(firstImageSrc);

            items.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'media-item';

                if (item.type === 'image') {
                    div.innerHTML = `
                        <img src="${item.src}" loading="lazy" crossorigin="anonymous" referrerpolicy="strict-origin-when-cross-origin" alt="Foto ${index + 1} de ${modelName}">
                        <div class="watermark">NOGLE</div>
                    `;
                    schemaItems.push({
                        "@type": "ImageObject",
                        "contentUrl": item.src,
                        "name": `Foto ${index + 1} - ${modelName}`
                    });
                } else if (item.type === 'video') {
                    div.innerHTML = `
                        <video src="${item.src}" preload="none" poster="${item.poster || ''}" crossorigin="anonymous" referrerpolicy="strict-origin-when-cross-origin" controls playsinline></video>
                        <div class="watermark">NOGLE</div>
                    `;
                }
                container.appendChild(div);
            });

            // EL BOTÓN INTELIGENTE FINAL
            const btnText = this.nextModelName ? `VER A ${this.nextModelName.toUpperCase()} ➔` : "EXPLORAR WEBCAMS 🔴";
            
            const premiumBtnDiv = document.createElement('div');
            premiumBtnDiv.style = "text-align: center; margin: 40px 15px;";
            premiumBtnDiv.innerHTML = `
                <button id="btn-premium-unlock" onclick="KnonPlayer.triggerPremiumAction()" style="
                    background: linear-gradient(90deg, #ff1493, #9400d3);
                    color: white; border: none; padding: 18px 25px; width: 100%; max-width: 400px; margin: 0 auto;
                    border-radius: 12px; font-weight: 900; letter-spacing: 2px;
                    text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
                    box-shadow: 0 4px 20px rgba(255, 20, 147, 0.4);
                    font-size: 13px; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;
                ">${btnText}</button>
            `;
            container.appendChild(premiumBtnDiv);

            this.injectSEO(schemaItems, modelName, firstImageSrc);

        } catch (error) {
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">Error de conexión.</p>';
        }
    },

    // --- INYECCIÓN SEO DINÁMICA ---
    injectSEO(schemaItems, modelName, firstImageSrc) {
        document.title = `${modelName} | NOGLE Premium`;
        
        const updateMeta = (attr, val, content) => {
            let el = document.querySelector(`meta[${attr}="${val}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, val);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };
        
        updateMeta('property', 'og:title', `${modelName} - Galería Exclusiva`);
        updateMeta('property', 'og:image', firstImageSrc);
        updateMeta('name', 'twitter:image', firstImageSrc);
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": `Galería de ${modelName}`,
            "hasPart": schemaItems
        });
        document.head.appendChild(script);
    }
};

// Arrancamos el motor
KnonPlayer.init();
