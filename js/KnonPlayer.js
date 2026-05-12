/* =========================================
   KNON PLAYER V2.0 PRO - NATIVE ADS EDITION
   (Navegación Infinita + Frequency Capping)
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    nextModelSlug: null,
    nextModelName: null,
    WORKER_URL: 'https://nogle-knon.villajonas09.workers.dev/',
    directLinkFired: false, 
    // AQUÍ PONES TU LINK REAL SI FALLA LA BACTERIA
    enlaceOculto: 'https://www.profitablecpmratenetwork.com/mr0myeg3r9?key=5b89d952a7ff6cd2cb479d5e60b0311e', 
    
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

    // --- LÓGICA DE CATÁLOGO (NAVEGACIÓN INFINITA) ---
    async loadCatalogoAndContent() {
        try {
            // 1. Buscamos el catálogo para saber quién sigue
            const catResponse = await fetch(`${this.WORKER_URL}catalogo.json`);
            const catData = await catResponse.json();
            const modelos = catData.modelos || [];

            if (modelos.length > 0) {
                // Encontrar el índice de la modelo actual
                const currentIndex = modelos.findIndex(m => m.id === this.currentModel);
                
                // Determinar la siguiente (si es la última, volvemos a la primera)
                let nextIndex = currentIndex + 1;
                if (nextIndex >= modelos.length || currentIndex === -1) {
                    nextIndex = 0;
                }
                
                this.nextModelSlug = modelos[nextIndex].id;
                this.nextModelName = modelos[nextIndex].name;
            }

            // 2. Cargamos el contenido de la modelo actual
            this.loadContent();

        } catch (error) {
            console.error("Error cargando catálogo", error);
            // Fallback si el catálogo falla: cargamos la galería normal
            this.loadContent(); 
        }
    },

    // --- CONTROL DE FRECUENCIA (CPM PROTECTOR) ---
    canFireAd() {
        const lastFired = localStorage.getItem('nogle_ad_last_fired');
        if (!lastFired) return true;

        const now = new Date().getTime();
        const timePassed = now - parseInt(lastFired);
        const hoursPassed = timePassed / (1000 * 60 * 60);

        // Retorna TRUE solo si pasaron más de 12 horas
        return hoursPassed >= 12;
    },

    recordAdFire() {
        localStorage.setItem('nogle_ad_last_fired', new Date().getTime().toString());
    },

    // --- ACCIÓN PREMIUM: GATILLO + REDIRECCIÓN ---
    triggerPremiumAction() {
        if (this.directLinkFired) return; // Evitar doble clic rápido
        this.directLinkFired = true; 

        const btn = document.getElementById('btn-premium-unlock');
        if(btn) {
            btn.innerHTML = "CONECTANDO... ⏳";
            btn.style.opacity = "0.7";
            btn.style.pointerEvents = "none"; // Desactivar el botón temporalmente
        }

        // 1. DISPARAMOS ADSTERRA (Solo si pasaron 12h)
        if (this.canFireAd() && this.enlaceOculto !== '') {
            window.open(this.enlaceOculto, '_blank');
            this.recordAdFire(); // Marcamos al usuario en la base de datos local
        }

        // 2. REDIRECCIÓN A LA SIGUIENTE MODELO
        setTimeout(() => {
            if (this.nextModelSlug) {
                // Navegar a la siguiente
                window.location.href = `?m=${this.nextModelSlug}`;
            } else {
                // Fallback de seguridad si no hay siguiente modelo
                if(btn) btn.innerHTML = "SALA PRIVADA LISTA ✔️";
            }
        }, 1500); // 1.5 segundos de "camuflaje de carga"
    },

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

            const statusTag = document.createElement('div');
            statusTag.style = "color: #00f2ff; font-size: 9px; text-align: center; margin-bottom: 20px; letter-spacing: 2px; font-weight: bold; opacity: 0.8;";
            statusTag.innerHTML = "✦ CONTENIDO VERIFICADO Y ACTUALIZADO ✦";
            container.appendChild(statusTag);

            const schemaItems = [];
            const modelName = this.formatName(this.currentModel);
            const firstImageSrc = items.find(i => i.type === 'image')?.src || '';

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

            // EL BOTÓN INTELIGENTE
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

    injectSEO(schemaItems, modelName, firstImageSrc) {
        document.title = `${modelName} | NOGLE Premium`;
        // ... (resto de tu lógica SEO original intacta) ...
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

KnonPlayer.init();
