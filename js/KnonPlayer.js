/* =========================================
   KNON PLAYER V2.0 PRO - POPUNDER EDITION
   (Monetización por Impresión + Menú Dinámico)
   ========================================= */

const KnonPlayer = {
    currentModel: null,
    nextModelSlug: null,
    nextModelName: null,
    WORKER_URL: 'https://nogle-knon.villajonas09.workers.dev/',
    // ENLACE DE POPUNDER (Monetiza por impresión)
    enlacePopunder: 'https://skinnycrawlinglax.com/h4bpbppz?qoi=15&refer=https%3A%2F%2Fnogle.vercel.app%2Fcazador&kw=%5B%22radar%22%2C%22knon%22%2C%22v3%22%2C%22con%22%2C%22eruda%22%5D&key=489fd23120820292cb2f5bba04598957&scrWidth=320&scrHeight=712&tz=-4&ship=1&v=2026.5.0&sub3=invoke_layer&res=14.485&dev=e&ifid=019e239d-eb53-7a4f-9d85-4a266c0d51e3&ibid=019e239e-c66a-74d9-afc8-85559925f76c&uuid=2db138d1-c26b-44e0-8576-dc787899e0bb%3A1%3A1', 
    modelosCache: [], 
    
    init() {
        const params = new URLSearchParams(window.location.search);
        this.currentModel = params.get('m'); 
        
        if(this.currentModel) {
            this.loadCatalogoAndContent();
        } else {
            const container = document.getElementById('gallery-container');
            if(container) container.innerHTML = '<p style="color:white; text-align:center; padding:50px;">Modelo no encontrada.</p>';
        }
    },

    formatName(slug) {
        if (!slug) return 'Modelo';
        return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

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

    renderFloatingMenu() {
        const profilesContainer = document.getElementById('fab-profiles-container');
        if (!profilesContainer || this.modelosCache.length === 0) return;
        
        profilesContainer.innerHTML = ''; 
        
        this.modelosCache.forEach(m => {
            const a = document.createElement('a');
            a.className = 'fab-profile';
            a.style.backgroundImage = `url('${m.cover}')`; // Carga el .webp desde R2
            a.href = this.enlacePopunder; 
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            
            a.addEventListener('click', (e) => {
                // Control de frecuencia para no saturar y mantener calidad de impresión
                if (this.canFireAd()) {
                    this.recordAdFire();
                    // Dejamos que el navegador abra el popunder naturalmente
                } else {
                    e.preventDefault();
                }

                const fabGallery = document.getElementById('knon-fab-gallery');
                if (fabGallery) fabGallery.style.display = 'none';

                this.changeModelDynamic(m.id);
            });
            
            profilesContainer.appendChild(a);
        });
    },

    changeModelDynamic(newModelId) {
        this.currentModel = newModelId;
        window.history.pushState({ path: `?m=${newModelId}` }, '', `?m=${newModelId}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const container = document.getElementById('gallery-container');
        if(container) {
            container.innerHTML = '<div style="text-align:center; padding:50px; color:#ff1493; letter-spacing:2px; font-size:12px; font-weight:bold;">CAMBIANDO SALA...</div>';
        }
        
        this.loadCatalogoAndContent();
    },

    canFireAd() {
        const lastFired = localStorage.getItem('nogle_pop_last_fired');
        if (!lastFired) return true;
        const now = new Date().getTime();
        const hoursPassed = (now - parseInt(lastFired)) / (1000 * 60 * 60);
        return hoursPassed >= 12; 
    },

    recordAdFire() {
        localStorage.setItem('nogle_pop_last_fired', new Date().getTime().toString());
    },

    async loadContent() {
        const container = document.getElementById('gallery-container');
        try {
            const response = await fetch(`${this.WORKER_URL}galeria.json?m=${this.currentModel}`);
            const payload = await response.json(); 
            const items = payload.items;

            container.innerHTML = '';

            if (!items || items.length === 0) {
                container.innerHTML = '<p style="color:#555; text-align:center; padding:50px;">Próximamente más contenido.</p>';
                return;
            }

            items.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'media-item';
                if (item.type === 'image') {
                    div.innerHTML = `<img src="${item.src}" loading="lazy" crossorigin="anonymous" alt="Nogle Premium"><div class="watermark">NOGLE</div>`;
                } else if (item.type === 'video') {
                    div.innerHTML = `<video src="${item.src}" poster="${item.poster || ''}" crossorigin="anonymous" controls playsinline></video><div class="watermark">NOGLE</div>`;
                }
                container.appendChild(div);
            });

            // Botón inferior para seguir navegando
            const btnText = this.nextModelName ? `VER A ${this.nextModelName.toUpperCase()} ➔` : "MÁS CONTENIDO 🔴";
            const btnDiv = document.createElement('div');
            btnDiv.style = "text-align: center; margin: 40px 15px;";
            btnDiv.innerHTML = `<button id="btn-premium-unlock" onclick="KnonPlayer.changeModelDynamic('${this.nextModelSlug}')" style="background: linear-gradient(90deg, #ff1493, #9400d3); color: white; border: none; padding: 18px 25px; width: 100%; max-width: 400px; border-radius: 12px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; box-shadow: 0 4px 20px rgba(255, 20, 147, 0.4); font-size: 13px;">${btnText}</button>`;
            container.appendChild(btnDiv);

        } catch (error) {
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">Error de conexión.</p>';
        }
    }
};

KnonPlayer.init();
