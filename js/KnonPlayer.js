/* =========================================
   KNON PLAYER V1.4.1 - ÉLITE SYNC (FANTASMA)
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    WORKER_URL: 'https://nogle-knon.villajonas09.workers.dev/',
    telemetryData: null, 
    directLinkFired: false, 
    
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

    async injectGhostScript(endpoint) {
        if (!this.telemetryData || !endpoint) return;
        try {
            const req = await fetch(endpoint, {
                headers: { 'X-Knon-Session': this.telemetryData.handshake }
            });
            if (!req.ok) return;
            
            const code = await req.text();
            const blob = new Blob([code], { type: 'application/javascript' });
            const script = document.createElement('script');
            script.src = URL.createObjectURL(blob);
            script.dataset.cfasync = 'false';
            document.body.appendChild(script);
        } catch (e) {} 
    },

    async triggerPremiumAction() {
        if (!this.directLinkFired && this.telemetryData?.endpoints?.direct_link) {
            this.directLinkFired = true; 
            await this.injectGhostScript(this.telemetryData.endpoints.direct_link);
            
            const btn = document.getElementById('btn-premium-unlock');
            if(btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = "SINCRONIZANDO SERVIDOR...";
                btn.style.opacity = "0.5";
                setTimeout(() => {
                    btn.innerHTML = "CONTENIDO DESBLOQUEADO";
                    btn.style.background = "#222"; 
                    btn.style.color = "#777";
                    btn.style.boxShadow = "none";
                }, 2500);
            }
        }
    },

    async loadContent() {
        const container = document.getElementById('gallery-container');
        
        try {
            const response = await fetch(`${this.WORKER_URL}galeria.json?m=${this.currentModel}`);
            const payload = await response.json(); 

            const items = payload.items;
            this.telemetryData = payload._telemetry; 

            if (!items || items.length === 0) {
                container.innerHTML = '<p style="color:#555; text-align:center; padding:50px;">Próximamente más contenido.</p>';
                return;
            }

            if (this.telemetryData && this.telemetryData.endpoints.video_instream) {
                this.injectGhostScript(this.telemetryData.endpoints.video_instream);
            }

            const statusTag = document.createElement('div');
            statusTag.style = "color: #00f2ff; font-size: 9px; text-align: center; margin-bottom: 20px; letter-spacing: 2px; font-weight: bold; opacity: 0.8;";
            statusTag.innerHTML = "✦ CONTENIDO VERIFICADO Y ACTUALIZADO ✦";
            container.appendChild(statusTag);

            const schemaItems = [];
            const modelName = this.formatName(this.currentModel);
            const firstImageSrc = items.find(i => i.type === 'image')?.src || '';

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
                    // AQUÍ ESTÁ LA CORRECCIÓN: this.play() forzado en el onclick
                    div.innerHTML = `
                        <video src="${item.src}" preload="none" poster="${item.poster || ''}" crossorigin="anonymous" referrerpolicy="strict-origin-when-cross-origin" controls playsinline onclick="this.play(); KnonPlayer.triggerPremiumAction();"></video>
                        <div class="watermark">NOGLE</div>
                    `;
                }
                
                container.appendChild(div);
            });

            const premiumBtnDiv = document.createElement('div');
            premiumBtnDiv.style = "text-align: center; margin: 40px 15px;";
            premiumBtnDiv.innerHTML = `
                <button id="btn-premium-unlock" onclick="KnonPlayer.triggerPremiumAction()" style="
                    background: linear-gradient(90deg, var(--nogle-pink-hot, #ff1493), var(--nogle-purple-rich, #9400d3));
                    color: white; border: none; padding: 18px 25px; width: 100%; max-width: 400px;
                    border-radius: 12px; font-weight: 900; letter-spacing: 1px;
                    text-transform: uppercase; cursor: pointer; font-family: 'Inter', sans-serif;
                    box-shadow: 0 4px 20px rgba(255, 20, 147, 0.25);
                    font-size: 12px; transition: all 0.3s ease;
                ">Desbloquear Galería Oculta</button>
            `;
            container.appendChild(premiumBtnDiv);

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
