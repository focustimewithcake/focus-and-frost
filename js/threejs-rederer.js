class ThreeJSRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.objects = new Map();
        
        // Cài đặt hiển thị
        this.settings = {
            showGrid: true,
            showLabels: true,
            showAxes: true
        };
        
        this.coordDisplay = document.getElementById('coord-display');
        this.init();
    }

    init() {
        // Tạo scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f2f5);

        // Tạo camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(6, 6, 6);

        // Tạo renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Thêm controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;

        // Thêm ánh sáng
        this.addLights();

        // Thêm hệ trục tọa độ
        this.addCoordinateSystem();

        // Bắt đầu animation loop
        this.animate();

        // Xử lý resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Theo dõi vị trí chuột
        this.setupMouseTracking();
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 12, 8);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    addCoordinateSystem() {
        // Trục tọa độ với màu sắc rõ ràng
        const axesHelper = new THREE.AxesHelper(4);
        axesHelper.setColors(
            new THREE.Color(0xff4444), // X - Đỏ
            new THREE.Color(0x44ff44), // Y - Xanh lá
            new THREE.Color(0x4444ff)  // Z - Xanh dương
        );
        this.scene.add(axesHelper);
        this.objects.set('axes', axesHelper);

        // Lưới tọa độ
        const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
        gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(gridHelper);
        this.objects.set('grid', gridHelper);

        // Nhãn trục
        this.addAxisLabels();
    }

    addAxisLabels() {
        const labels = [
            { text: 'X', position: [5, 0, 0], color: '#ff4444' },
            { text: 'Y', position: [0, 5, 0], color: '#44ff44' },
            { text: 'Z', position: [0, 0, 5], color: '#4444ff' }
        ];

        labels.forEach(label => {
            this.addTextLabel(label.text, label.position, label.color);
        });
    }

    addTextLabel(text, position, color = '#000000') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 32;
        
        context.fillStyle = color;
        context.font = 'bold 20px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 32, 16);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(...position);
        sprite.scale.set(1, 0.5, 1);
        
        this.scene.add(sprite);
        this.objects.set(`label_${text}`, sprite);
    }

    setupMouseTracking() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Cập nhật tọa độ camera
            this.updateCoordinateDisplay();
        });

        this.controls.addEventListener('change', () => {
            this.updateCoordinateDisplay();
        });
    }

    updateCoordinateDisplay() {
        const position = this.camera.position;
        const target = this.controls.target;
        
        this.coordDisplay.innerHTML = `
            Camera: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})<br>
            Trung tâm: (${target.x.toFixed(1)}, ${target.y.toFixed(1)}, ${target.z.toFixed(1)})
        `;
    }

    addPoint(point, label, color = 0xff3333, size = 0.15) {
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color,
            shininess: 100 
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(point.x, point.y, point.z);
        
        this.scene.add(sphere);
        this.objects.set(`point_${label}`, sphere);

        // Thêm nhãn điểm
        if (this.settings.showLabels) {
            this.addPointLabel(point, label);
        }

        return sphere;
    }

    addPointLabel(position, text, color = '#2c3e50') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 80;
        canvas.height = 40;
        
        context.fillStyle = color;
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, 40, 20);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(position.x + 0.3, position.y + 0.3, position.z + 0.3);
        sprite.scale.set(1.5, 0.75, 1);
        
        this.scene.add(sprite);
        this.objects.set(`label_${text}`, sprite);
    }

    addLine(from, to, color = 0x0066ff, lineWidth = 3) {
        const material = new THREE.LineBasicMaterial({ 
            color, 
            linewidth: lineWidth 
        });
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(from.x, from.y, from.z),
            new THREE.Vector3(to.x, to.y, to.z)
        ]);
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        
        const lineId = `line_${Date.now()}`;
        this.objects.set(lineId, line);
        return lineId;
    }

    // Các phương thức toggle hiển thị
    toggleGrid() {
        this.settings.showGrid = !this.settings.showGrid;
        const grid = this.objects.get('grid');
        if (grid) grid.visible = this.settings.showGrid;
        return this.settings.showGrid;
    }

    toggleLabels() {
        this.settings.showLabels = !this.settings.showLabels;
        Array.from(this.objects.entries()).forEach(([key, obj]) => {
            if (key.startsWith('label_')) {
                obj.visible = this.settings.showLabels;
            }
        });
        return this.settings.showLabels;
    }

    toggleAxes() {
        this.settings.showAxes = !this.settings.showAxes;
        const axes = this.objects.get('axes');
        if (axes) axes.visible = this.settings.showAxes;
        return this.settings.showAxes;
    }

    // ... (giữ nguyên các phương thức khác)

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
