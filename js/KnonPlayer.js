const app = {
    // 1. DATA: Aquí agregarás tus modelos de R2 más tarde
    creators: [
        {
            id: "maria-vip",
            name: "María VIP",
            cover: "https://via.placeholder.com/600x800/111/fff?text=Maria+Cover",
            badge: "NUEVA",
            description: "24 Galerías • 5 Videos",
            link: "https://onlyfans.com/maria",
            content: [
                { type: "image", src: "https://via.placeholder.com/600x1000/222/fff?text=Foto+1" },
                { type: "hybrid", webp: "https://via.placeholder.com/600x1000/111/fff?text=WebP+Loop", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
                { type: "image", src: "https://via.placeholder.com/600x1000/333/fff?text=Foto+2" }
            ]
        },
        {
            id: "sofia-luxury",
            name: "Sofia Luxury",
            cover: "https://via.placeholder.com/600x800/222/fff?text=Sofia+Cover",
            badge: "POPULAR",
            description: "15 Galerías • 2 Videos",
            link: "https://onlyfans.com/sofia",
            content: []
        }
    ],

    // 2. NAVEGACIÓN
    init() {
        this.container = document.getElementById('main-content');
        this.showLibrary();
        this.initObserver();
    },

    showLibrary() {
        window.scrollTo(0,0);
        this.container.classList.remove('viewer-mode');
        let html = `<div class="knon-grid">`;
        this.creators.forEach(c => {
            html += `
                <div class="knon-card" onclick="app.showViewer('${c.id}')">
                    <div class="badge">${c.badge}</div>
                    <img src="${c.cover}" loading="lazy">
                    <div class="info">
                        <h3>${c.name}</h3>
                        <p>${c.description}</p>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        this.container.innerHTML = html;
    },

    showViewer(id) {
        window.scrollTo(0,0);
        const creator = this.creators.find(c => c.id === id);
        this.container.classList.add('viewer-mode');
        
        let html = "";
        creator.content.forEach(item => {
            if(item.type === 'image') {
                html += `<img src="${item.src}" class="media-item" style="width:100%; display:block; opacity:1">`;
            } else {
                html += `
                    <div class="media-wrapper" data-video="${item.video}">
                        <img src="${item.webp}" class="webp-layer" loading="lazy">
                    </div>`;
            }
        });

        html += `
            <a href="${creator.link}" class="btn-premium">Suscríbete ahora</a>
            <div class="knon-footer">Architecture by <span class="knon-signature">Knon</span> ECOSYSTEM</div>
        `;
        
        this.container.innerHTML = html;
        this.rebindObserver();
    },

    // 3. LÓGICA DEL REPRODUCTOR HÍBRIDO (Foco y Autodestrucción)
    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const wrapper = entry.target;
                const videoSrc = wrapper.dataset.video;
                if (entry.isIntersecting) {
                    let video = wrapper.querySelector('video');
                    if (!video) {
                        video = document.createElement('video');
                        video.className = 'video-layer';
                        video.src = videoSrc;
                        video.muted = true; video.loop = true; video.playsInline = true;
                        video.onplaying = () => wrapper.classList.add('video-ready');
                        wrapper.appendChild(video);
                    }
                    video.play().catch(() => {});
                } else {
                    const video = wrapper.querySelector('video');
                    if (video) {
                        video.pause(); video.removeAttribute('src'); video.load(); video.remove();
                    }
                    wrapper.classList.remove('video-ready');
                }
            });
        }, { threshold: 0.6 });
    },

    rebindObserver() {
        document.querySelectorAll('.media-wrapper').forEach(w => this.observer.observe(w));
    }
};

app.init();
