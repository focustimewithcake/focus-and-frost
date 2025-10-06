class ThreeJSRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.objects = new Map();
        
        this.init();
    }

    init() {
        // Tạo scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);

        // Tạo camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);

        // Tạo renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Thêm controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Thêm ánh sáng
        this.addLights();

        // Thêm trục tọa độ
        this.addCoordinateSystem();

        // Bắt đầu animation loop
        this.animate();

        // Xử lý resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    addLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.4);
        this.scene.add(hemisphereLight);
    }

    addCoordinateSystem() {
        // Trục tọa độ
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // Lưới
        const gridHelper = new THREE.GridHelper(10, 10);
        gridHelper.rotation.x = Math.PI / 2;
        this.scene.add(gridHelper);
    }

    addPoint(point, label, color = 0xff0000) {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(point.x, point.y, point.z);
        
        this.scene.add(sphere);
        this.objects.set(`point_${label}`, sphere);

        // Thêm nhãn
        this.addLabel(point, label);
    }

    addLabel(position, text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        
        context.fillStyle = '#2c3e50';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(text, 64, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(position.x + 0.2, position.y + 0.2, position.z + 0.2);
        sprite.scale.set(1, 0.5, 1);
        
        this.scene.add(sprite);
        this.objects.set(`label_${text}`, sprite);
    }

    addLine(from, to, color = 0x0000ff, lineWidth = 2) {
        const material = new THREE.LineBasicMaterial({ color, linewidth: lineWidth });
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

    addPolygon(points, color = 0x00ff00, opacity = 0.3) {
        const vertices = points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
        
        // Tạo mặt
        const indices = [];
        for (let i = 1; i < points.length - 1; i++) {
            indices.push(0, i, i + 1);
        }
        geometry.setIndex(indices);
        
        const material = new THREE.MeshPhongMaterial({ 
            color, 
            transparent: true, 
            opacity,
            side: THREE.DoubleSide 
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        
        const polygonId = `polygon_${Date.now()}`;
        this.objects.set(polygonId, mesh);
        return polygonId;
    }

    removeObject(id) {
        if (this.objects.has(id)) {
            const obj = this.objects.get(id);
            this.scene.remove(obj);
            this.objects.delete(id);
        }
    }

    clearAll() {
        for (const [id, obj] of this.objects) {
            this.scene.remove(obj);
        }
        this.objects.clear();
        
        // Giữ lại hệ trục tọa độ và ánh sáng
        this.addCoordinateSystem();
    }

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
