/* KNON PLAYER V1.0 - NOGLE EDITION
   Cerebro dinámico para visor independiente
*/

const KnonPlayer = {
    currentModel: null,
    
    init() {
        // 1. Obtener el nombre de la modelo desde la URL (ej: visor.html?m=maria)
        const params = new URLSearchParams(window.location.search);
        this.currentModel = params.get('m') || 'default';
        
        this.loadContent();
    },

    async loadContent() {
        const container = document.getElementById('gallery-container');
        
        /* Aquí es donde el fin de semana conectaremos con tu Cloudflare Worker.
           Por ahora, simulamos la respuesta inteligente.
        */
        
        // Simulación de datos recibidos del Worker/R2
        const response = {
            images: [
                "https://via.placeholder.com/600x1000/111/fff?text=Foto+1",
                "https://via.placeholder.com/600x1000/222/fff?text=Foto+2",
                "https://via.placeholder.com/600x1000/333/fff?text=Foto+3"
            ],
            hasMore: true // Esto lo decidirá el Worker automáticamente
        };

        // Renderizado Dinámico con Marca de Agua
        response.images.forEach(src => {
            const div = document.createElement('div');
            div.className = 'media-item';
            div.innerHTML = `
                <img src="${src}" loading="lazy">
                <div class="watermark">NOGLE</div>
            `;
            container.appendChild(div);
        });

        // Inteligencia del Botón Siguiente
        if(response.hasMore) {
            document.getElementById('btn-next').style.display = 'block';
        }
    }
};

// Iniciar proyector
KnonPlayer.init();

function loadMore() {
    alert("Conectando con el Worker para traer más fotos...");
    // Aquí irá la llamada fetch real a tu R2
}
