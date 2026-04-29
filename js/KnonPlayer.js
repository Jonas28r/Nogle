/* =========================================
   KNON PLAYER V1.1 - R2 CONNECTED
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

    async loadContent() {
        const container = document.getElementById('gallery-container');
        
        try {
            // Le pedimos al Worker la galería específica (ej. ?m=karla)
            const response = await fetch(`${this.WORKER_URL}galeria.json?m=${this.currentModel}`);
            const data = await response.json();

            if (data.items.length === 0) {
                container.innerHTML = '<p style="color:#555; text-align:center; padding:50px;">No hay fotos publicadas aún.</p>';
                return;
            }

            data.items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'media-item';

                if (item.type === 'image') {
                    // crossorigin="anonymous" es VITAL para que funcione el escudo protector de tu Worker
                    div.innerHTML = `
                        <img src="${item.src}" loading="lazy" crossorigin="anonymous" alt="Nogle Exclusive">
                        <div class="watermark">NOGLE</div>
                    `;
                } 
                // Aquí mantendremos tu lógica híbrida (video) para el futuro
                container.appendChild(div);
            });

            this.initObserver();

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">Error de conexión con Knon Ecosystem.</p>';
        }
    },

    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            // Lógica de RAM intacta para el futuro cuando metas videos
        }, { threshold: 0.5 });
    }
};

KnonPlayer.init();
