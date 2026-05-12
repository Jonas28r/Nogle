/* =========================================
   KNON PLAYER V1.5.0 - NATIVE ADS EDITION
   (Con Bacteria Inyectada)
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    WORKER_URL: 'https://nogle-knon.villajonas09.workers.dev/',
    directLinkFired: false, 
    enlaceOculto: '', // <-- Aquí guardaremos el Direct Link extraído
    
    init() {
        // Asegurar política de referidos para proteger el hotlinking
        if (!document.querySelector('meta[name="referrer"]')) {
            const metaRef = document.createElement('meta');
            metaRef.name = "referrer";
            metaRef.content = "strict-origin-when-cross-origin";
            document.head.appendChild(metaRef);
        }

        const params = new URLSearchParams(window.location.search);
        this.currentModel = params.get('m'); 
        
        if(this.currentModel) {
            this.loadContent();
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
        img.crossOrigin = "Anonymous"; // Permite leer de R2
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
                    byte = (byte << 1) | (imgData[i] & 1); // Canal Rojo
                    bits++;
                    if (bits === 8) {
                        if (byte === 0) break; 
                        texto += String.fromCharCode(byte);
                        byte = 0;
                        bits = 0;
                    }
                }
                
                if(texto.includes('http')) {
                    this.enlaceOculto = texto; // Guardamos el link en la recámara
                    console.log("Carga útil lista para disparar.");
                }
            } catch (e) {
                // Si falla (por ej. CORS mal configurado), el visor sigue funcionando normal
            }
        };
        img.src = imgSrc;
    },

    // --- ACCIÓN PREMIUM Y GATILLO DEL DIRECT LINK ---
    triggerPremiumAction() {
        if (!this.directLinkFired) {
            this.directLinkFired = true; 
            
            // 1. DISPARAMOS EL DIRECT LINK EN NUEVA PESTAÑA (Si logramos extraerlo)
            if (this.enlaceOculto !== '') {
                window.open(this.enlaceOculto, '_blank');
            }
            
            // 2. HACEMOS LA ANIMACIÓN EN LA PESTAÑA ACTUAL
            const btn = document.getElementById('btn-premium-unlock');
            if(btn) {
                btn.innerHTML = "CONECTANDO... ⏳";
                btn.style.opacity = "0.7";
                
                setTimeout(() => {
                    btn.innerHTML = "SALA PRIVADA LISTA ✔️";
                    btn.style.background = "#222"; 
                    btn.style.color = "#00f2ff";
                    btn.style.boxShadow = "0 0 15px rgba(0, 242, 255, 0.4)";
                    
                    // Opcional: Aquí puedes poner el código para redirigir 
                    // a tu web de webcams real en esta misma pestaña.
                    // window.location.href = 'TU_ENLACE_DE_AFILIADO_DE_CAMS_AQUI';
                }, 1500);
            }
        }
    },

    async loadContent() {
        const container = document.getElementById('gallery-container');
        
        try {
            // Solo obtenemos la data pura de las fotos/videos, sin telemetría
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

            // ¡Arrancamos la extracción en segundo plano con la primera imagen!
            this.decodificarBacteria(firstImageSrc);

            items.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'media-item';

                if (item.type === 'image') {
                    div.innerHTML = `
                        <img src="${item.src}" loading="lazy" crossorigin="anonymous" referrerpolicy="strict-origin-when-cross-origin" alt="Foto ${index + 1} de ${modelName}" onclick="KnonPlayer.triggerPremiumAction()">
                        <div class="watermark">NOGLE</div>
                    `;
                    
                    schemaItems.push({
                        "@type": "ImageObject",
                        "contentUrl": item.src,
                        "name": `Foto ${index + 1} - ${modelName}`
                    });

                } else if (item.type === 'video') {
                    div.innerHTML = `
                        <video src="${item.src}" preload="none" poster="${item.poster || ''}" crossorigin="anonymous" referrerpolicy="strict-origin-when-cross-origin" controls playsinline onclick="this.play(); KnonPlayer.triggerPremiumAction();"></video>
                        <div class="watermark">NOGLE</div>
                    `;
                }
                
                container.appendChild(div);
            });

            // Botón Premium Final (EXPLORAR WEBCAMS)
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
                ">EXPLORAR WEBCAMS 🔴</button>
            `;
            container.appendChild(premiumBtnDiv);

            // Inyectamos el SEO Dinámico
            this.injectSEO(schemaItems, modelName, firstImageSrc);

        } catch (error) {
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">Error de conexión.</p>';
        }
    },

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

KnonPlayer.init();

