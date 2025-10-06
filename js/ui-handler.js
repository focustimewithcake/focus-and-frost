class UIHandler {
    constructor(geometryCalculator, threeRenderer) {
        this.geometryCalculator = geometryCalculator;
        this.threeRenderer = threeRenderer;
        this.model = {
            points: new Map(),
            edges: [],
            faces: [],
            annotations: []
        };
        
        this.initEventListeners();
        this.setupQuickActions();
    }

    initEventListeners() {
        // Nút tạo mô hình
        document.getElementById('generate-btn').addEventListener('click', () => this.generateModel());
        
        // Nút xác nhận thêm điểm/quan hệ
        document.getElementById('confirm-btn').addEventListener('click', () => this.handleAddPoint());
        
        // Nút reset
        document.getElementById('reset-btn').addEventListener('click', () => this.resetModel());
        
        // Nút export
        document.getElementById('export-btn').addEventListener('click', () => this.exportModel());
        
        // Enter để xác nhận
        document.getElementById('command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddPoint();
        });

        // Toggle controls
        document.getElementById('toggle-grid').addEventListener('click', () => {
            const isVisible = this.threeRenderer.toggleGrid();
            document.getElementById('toggle-grid').textContent = `Lưới: ${isVisible ? 'Bật' : 'Tắt'}`;
        });

        document.getElementById('toggle-labels').addEventListener('click', () => {
            const isVisible = this.threeRenderer.toggleLabels();
            document.getElementById('toggle-labels').textContent = `Nhãn: ${isVisible ? 'Bật' : 'Tắt'}`;
        });

        document.getElementById('toggle-axes').addEventListener('click', () => {
            const isVisible = this.threeRenderer.toggleAxes();
            document.getElementById('toggle-axes').textContent = `Trục: ${isVisible ? 'Bật' : 'Tắt'}`;
        });

        // Hiển thị/ẩn cạnh b tùy theo loại hình
        document.getElementById('shape-type').addEventListener('change', () => this.updateDimensionVisibility());
        document.getElementById('base-type').addEventListener('change', () => this.updateDimensionVisibility());
        
        this.updateDimensionVisibility();
    }

    setupQuickActions() {
        document.querySelectorAll('.quick-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        const pointName = document.getElementById('point-name').value.trim() || this.generatePointName();
        
        switch (action) {
            case 'midpoint':
                document.getElementById('command').value = 'trungdiem AB';
                document.getElementById('point-name').value = pointName;
                break;
            case 'centroid':
                document.getElementById('command').value = 'trongtam ABC';
                document.getElementById('point-name').value = pointName;
                break;
            case 'perpendicular':
                document.getElementById('command').value = 'vuonggoc A BC';
                document.getElementById('point-name').value = pointName;
                break;
        }
        
        document.getElementById('command').focus();
    }

    generatePointName() {
        const existingPoints = Array.from(this.model.points.keys());
        for (let i = 1; i <= 26; i++) {
            const name = `M${i}`;
            if (!existingPoints.includes(name)) {
                return name;
            }
        }
        return `P${Date.now().toString().slice(-3)}`;
    }

    updateDimensionVisibility() {
        const shapeType = document.getElementById('shape-type').value;
        const baseType = document.getElementById('base-type').value;
        const sideBGroup = document.getElementById('side-b-group');
        
        // Ẩn hiện cạnh b tùy theo hình dạng
        if (shapeType === 'cube' || (shapeType === 'prism' && baseType === 'triangle')) {
            sideBGroup.style.display = 'none';
        } else {
            sideBGroup.style.display = 'block';
        }
    }

    // ... (giữ nguyên các phương thức khác, nhưng thêm xử lý cú pháp đơn giản hơn)

    parseCommand(pointName, command) {
        const cmd = command.toLowerCase().trim();
        
        // Xử lý các cú pháp đơn giản
        if (cmd.includes('trungdiem') || cmd.includes('trung điểm')) {
            const points = this.extractPoints(cmd);
            if (points.length === 2) {
                return this.createMidpoint(pointName, points.join(''));
            }
        }
        
        if (cmd.includes('trongtam') || cmd.includes('trọng tâm')) {
            const points = this.extractPoints(cmd);
            if (points.length === 3) {
                return this.createCentroid(pointName, points.join(''));
            }
        }
        
        if (cmd.includes('vuonggoc') || cmd.includes('vuông góc') || cmd.includes('⟂')) {
            const parts = cmd.split(/\s+/);
            if (parts.length >= 3) {
                const A = parts[parts.length - 2];
                const BC = parts[parts.length - 1];
                if (A && BC && BC.length === 2) {
                    return this.createFootOfPerpendicular(pointName, A, BC);
                }
            }
        }
        
        // Xử lý cú pháp tự nhiên
        if (cmd.includes('là trung điểm của')) {
            const points = this.extractPoints(cmd);
            if (points.length === 2) {
                return this.createMidpoint(pointName, points.join(''));
            }
        }
        
        throw new Error(`Không hiểu lệnh: "${command}". Thử: "M là trung điểm AB", "G là trọng tâm ABC", "AH ⟂ BC"`);
    }

    extractPoints(text) {
        // Trích xuất các điểm từ chuỗi (A, B, C, ...)
        return text.match(/[A-Z]\b/g) || [];
    }

    // ... (giữ nguyên phần còn lại)
}
