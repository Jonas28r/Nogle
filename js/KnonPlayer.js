/* =========================================
   KNON PLAYER V2.0 PRO - NATIVE ADS EDITION
   (Navegación Infinita + Floating Dynamic Menu)
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    nextModelSlug: null,
    nextModelName: null,
    WORKER_URL: 'https://nogle-knon.villajonas09.workers.dev/',
    
    // Control de clics múltiples en el botón
    premiumActionFired: false, 
    
    // ENLACES DE MONETIZACIÓN
    enlaceOculto: 'https://www.profitablecpmratenetwork.com/mr0myeg3r9?key=5b89d952a7ff6cd2cb479d5e60b0311e', // Direct Link (Se actualiza con la bacteria)
    popunderURL: 'https://skinnycrawlinglax.com/h4bpbppz?qoi=15&refer=https%3A%2F%2Fnogle.vercel.app%2Fcazador&kw=%5B%22radar%22%2C%22knon%22%2C%22v3%22%2C%22con%22%2C%22eruda%22%5D&key=489fd23120820292cb2f5bba04598957&scrWidth=320&scrHeight=712&tz=-4&ship=1&v=2026.5.0&sub3=invoke_layer&res=14.485&dev=e&ifid=019e239d-eb53-7a4f-9d85-4a266c0d51e3&ibid=019e239e-c66a-74d9-afc8-85559925f76c&uuid=2db138d1-c26b-44e0-8576-dc787899e0bb%3A1%3A1', // Popunder Adsterra
    
    // CONFIGURACIÓN DE FRECUENCIA
    COOLDOWN_HOURS: 3, 
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
                    this.enlaceOculto = texto; // Actualiza el Direct Link dinámicamente
                }
            } catch (e) {}
        };
        img.src = imgSrc;
    },

    // --- LÓGICA DE CATÁLOGO E INYECCIÓN DINÁMICA ---
    async loadCatalogoAndContent() {
        try {
            const catResponse = await fetch(`${this.WORKER_URL}catalogo.json`);
            const catData = await catResponse.json();
            this.modelosCache = catData.modelos || [];

            if (this.modelosCache.length > 0) {
                const currentIndex = this.modelosCache.findIndex(m => m.id === this.currentModel);
                let nextIndex = currentIndex + 1;
                if (nextIndex >= this.modelosCache.length || currentIndex === -1) {
                    nextIndex = 0;
                }
                
                this.nextModelSlug = this.modelosCache[nextIndex].id;
                this.nextModelName = this.modelosCache[nextIndex].name;
            }

            this.renderFloatingMenu();
            this.loadContent();

        } catch (error) {
            console.error("Error cargando catálogo", error);
            this.loadContent(); 
        }
    },

    // --- EL CREADOR DEL MENÚ BURBUJA (DIRECT LINK) ---
    renderFloatingMenu() {
        const profilesContainer = document.getElementById('fab-profiles-container');
        if (!profilesContainer || this.modelosCache.length === 0) return;
        
        profilesContainer.innerHTML = ''; 
        
        this.modelosCache.forEach(m => {
            const a = document.createElement('a');
            a.className = 'fab-profile';
            a.style.backgroundImage = `url('${m.cover}')`;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            
            // Acción al tocar una burbuja (MENÚ = DIRECT LINK)
            a.addEventListener('click', (e) => {
                if (this.canFireAd('directlink') && this.enlaceOculto !== '') {
                    a.href = this.enlaceOculto; 
                    this.recordAdFire('directlink');
                } else {
                    // Si está en cooldown de 3 horas, bloqueamos el abrir pestaña
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

    // Efecto SPA (Single Page Application)
    changeModelDynamic(newModelId) {
        this.currentModel = newModelId;
        window.history.pushState({ path: `?m=${newModelId}` }, '', `?m=${newModelId}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const container = document.getElementById('gallery-container');
        if(container) {
            container.innerHTML = '<div style="text-align:center; padding:50px; color:#ff1493; letter-spacing:2px; font-size:12px; font-weight:bold;">CARGANDO SALA PRIVADA...</div>';
        }
        
        this.loadCatalogoAndContent();
    },

    // --- CONTROL DE FRECUENCIA DUAL (CPM PROTECTOR) ---
    canFireAd(adType) {
        const lastFired = localStorage.getItem(`nogle_${adType}_last_fired`);
        if (!lastFired) return true;

        const now = new Date().getTime();
        const timePassed = now - parseInt(lastFired);
        const hoursPassed = timePassed / (1000 * 60 * 60);

        return hoursPassed >= this.COOLDOWN_HOURS;
    },

    recordAdFire(adType) {
        localStorage.setItem(`nogle_${adType}_last_fired`, new Date().getTime().toString());
    },

    // --- ACCIÓN PREMIUM: GATILLO DEL BOTÓN FINAL (POPUNDER) ---
    triggerPremiumAction() {
        if (this.premiumActionFired) return; 
        this.premiumActionFired = true; 

        const btn = document.getElementById('btn-premium-unlock');
        if(btn) {
            btn.innerHTML = "CONECTANDO... ⏳";
            btn.style.opacity = "0.7";
            btn.style.pointerEvents = "none"; 
        }

        // EL BOTÓN DISPARA EL POPUNDER DE ADSTERRA
        if (this.canFireAd('popunder') && this.popunderURL !== '') {
            window.open(this.popunderURL, '_blank');
            this.recordAdFire('popunder'); 
        }

        setTimeout(() => {
            if (this.nextModelSlug) {
                this.changeModelDynamic(this.nextModelSlug);
                
                this.premiumActionFired = false;
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
