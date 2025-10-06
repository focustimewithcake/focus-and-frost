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
    }

    initEventListeners() {
        // Nút tạo mô hình
        document.getElementById('generate-btn').addEventListener('click', () => this.generateModel());
        
        // Nút xác nhận thêm điểm/quan hệ
        document.getElementById('confirm-btn').addEventListener('click', () => this.handleAddPoint());
        
        // Nút reset
        document.getElementById('reset-btn').addEventListener('click', () => this.resetModel());
        
        // Enter để xác nhận
        document.getElementById('command').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddPoint();
        });
    }

    generateModel() {
        const shapeType = document.getElementById('shape-type').value;
        const baseType = document.getElementById('base-type').value;
        const a = parseFloat(document.getElementById('side-a').value) || 2;
        const b = parseFloat(document.getElementById('side-b').value) || 2;
        const h = parseFloat(document.getElementById('height').value) || 2;

        this.threeRenderer.clearAll();
        this.model.points.clear();
        this.model.edges = [];
        this.model.faces = [];
        this.model.annotations = [];

        let points = [];
        
        switch (shapeType) {
            case 'cube':
                points = this.generateCube(a);
                break;
            case 'cuboid':
                points = this.generateCuboid(a, b, h);
                break;
            case 'tetrahedron':
                points = this.generateTetrahedron(a);
                break;
            case 'prism':
                points = this.generatePrism(baseType, a, b, h);
                break;
        }

        // Thêm điểm vào model và render
        points.forEach(point => {
            this.model.points.set(point.id, point);
            this.threeRenderer.addPoint(point, point.id);
        });

        // Vẽ các cạnh
        this.drawEdges();
        
        this.showStatus('Đã tạo mô hình thành công!', 'success');
    }

    generateCube(a = 2) {
        const half = a / 2;
        return [
            { id: 'A', x: -half, y: -half, z: -half },
            { id: 'B', x: half, y: -half, z: -half },
            { id: 'C', x: half, y: half, z: -half },
            { id: 'D', x: -half, y: half, z: -half },
            { id: 'A1', x: -half, y: -half, z: half },
            { id: 'B1', x: half, y: -half, z: half },
            { id: 'C1', x: half, y: half, z: half },
            { id: 'D1', x: -half, y: half, z: half }
        ];
    }

    generateCuboid(a = 3, b = 2, c = 1.5) {
        const halfA = a / 2;
        const halfB = b / 2;
        const halfC = c / 2;
        return [
            { id: 'A', x: -halfA, y: -halfB, z: -halfC },
            { id: 'B', x: halfA, y: -halfB, z: -halfC },
            { id: 'C', x: halfA, y: halfB, z: -halfC },
            { id: 'D', x: -halfA, y: halfB, z: -halfC },
            { id: 'A1', x: -halfA, y: -halfB, z: halfC },
            { id: 'B1', x: halfA, y: -halfB, z: halfC },
            { id: 'C1', x: halfA, y: halfB, z: halfC },
            { id: 'D1', x: -halfA, y: halfB, z: halfC }
        ];
    }

    generateTetrahedron(a = 2) {
        const height = a * Math.sqrt(2/3);
        return [
            { id: 'A', x: 0, y: 0, z: height / 2 },
            { id: 'B', x: a / 2, y: -a * Math.sqrt(3) / 6, z: -height / 2 },
            { id: 'C', x: -a / 2, y: -a * Math.sqrt(3) / 6, z: -height / 2 },
            { id: 'D', x: 0, y: a * Math.sqrt(3) / 3, z: -height / 2 }
        ];
    }

    generatePrism(baseType, a, b, h) {
        // Implementation for different base types
        // This is a simplified version
        const basePoints = this.generateBase(baseType, a, b);
        const topPoints = basePoints.map(pt => ({
            ...pt,
            id: pt.id + "'",
            z: pt.z + h
        }));
        
        return [...basePoints, ...topPoints];
    }

    generateBase(baseType, a, b) {
        // Implementation for different base shapes
        switch (baseType) {
            case 'square':
            case 'rectangle':
                return [
                    { id: 'A', x: -a/2, y: -b/2, z: 0 },
                    { id: 'B', x: a/2, y: -b/2, z: 0 },
                    { id: 'C', x: a/2, y: b/2, z: 0 },
                    { id: 'D', x: -a/2, y: b/2, z: 0 }
                ];
            case 'equilateral':
                const height = a * Math.sqrt(3) / 2;
                return [
                    { id: 'A', x: 0, y: height/2, z: 0 },
                    { id: 'B', x: -a/2, y: -height/2, z: 0 },
                    { id: 'C', x: a/2, y: -height/2, z: 0 }
                ];
            default:
                return this.generateBase('square', a, b);
        }
    }

    drawEdges() {
        // Vẽ các cạnh cơ bản dựa trên các điểm
        const pointsArray = Array.from(this.model.points.values());
        
        // Đây là logic đơn giản, cần mở rộng cho từng loại hình
        for (let i = 0; i < pointsArray.length; i++) {
            for (let j = i + 1; j < pointsArray.length; j++) {
                const dist = this.geometryCalculator.distanceBetweenPoints(
                    pointsArray[i], pointsArray[j]
                );
                
                // Nếu khoảng cách gần với kích thước cạnh, vẽ đường
                if (Math.abs(dist - parseFloat(document.getElementById('side-a').value || 2)) < 0.1) {
                    this.threeRenderer.addLine(pointsArray[i], pointsArray[j]);
                    this.model.edges.push({
                        from: pointsArray[i].id,
                        to: pointsArray[j].id
                    });
                }
            }
        }
    }

    handleAddPoint() {
        const pointName = document.getElementById('point-name').value.trim();
        const pointType = document.getElementById('point-type').value;
        const pointLink = document.getElementById('point-link').value.trim();
        const command = document.getElementById('command').value.trim();

        if (!pointName) {
            this.showStatus('Vui lòng nhập tên điểm', 'error');
            return;
        }

        // Kiểm tra tên điểm hợp lệ
        if (!/^[A-Za-z0-9_]{1,4}$/.test(pointName)) {
            this.showStatus('Tên điểm chỉ được chứa chữ cái, số và gạch dưới (1-4 ký tự)', 'error');
            return;
        }

        let newPoint = null;

        try {
            switch (pointType) {
                case 'midpoint':
                    newPoint = this.createMidpoint(pointName, pointLink);
                    break;
                case 'centroid':
                    newPoint = this.createCentroid(pointName, pointLink);
                    break;
                case 'foot':
                    newPoint = this.createFootOfPerpendicular(pointName, pointLink);
                    break;
                case 'intersection':
                    newPoint = this.createIntersection(pointName, pointLink);
                    break;
                default:
                    newPoint = this.parseCommand(pointName, command);
            }

            if (newPoint) {
                this.model.points.set(pointName, newPoint);
                this.threeRenderer.addPoint(newPoint, pointName, 0x00ff00);
                this.showStatus(`Đã thêm điểm ${pointName} tại (${newPoint.x.toFixed(2)}, ${newPoint.y.toFixed(2)}, ${newPoint.z.toFixed(2)})`, 'success');
                
                // Clear input
                document.getElementById('point-name').value = '';
                document.getElementById('point-link').value = '';
                document.getElementById('command').value = '';
            }

        } catch (error) {
            this.showStatus(error.message, 'error');
        }
    }

    createMidpoint(pointName, pointLink) {
        if (pointLink.length !== 2) {
            throw new Error('Liên kết cho trung điểm phải là 2 điểm (ví dụ: AB)');
        }

        const A = this.model.points.get(pointLink[0]);
        const B = this.model.points.get(pointLink[1]);

        if (!A || !B) {
            throw new Error(`Không tìm thấy điểm ${pointLink[0]} hoặc ${pointLink[1]}`);
        }

        return {
            id: pointName,
            ...this.geometryCalculator.midpoint(A, B)
        };
    }

    createCentroid(pointName, pointLink) {
        if (pointLink.length !== 3) {
            throw new Error('Liên kết cho trọng tâm phải là 3 điểm (ví dụ: ABC)');
        }

        const A = this.model.points.get(pointLink[0]);
        const B = this.model.points.get(pointLink[1]);
        const C = this.model.points.get(pointLink[2]);

        if (!A || !B || !C) {
            throw new Error(`Không tìm thấy điểm ${pointLink}`);
        }

        return {
            id: pointName,
            ...this.geometryCalculator.centroid(A, B, C)
        };
    }

    parseCommand(pointName, command) {
        if (!command) {
            throw new Error('Vui lòng nhập lệnh quan hệ');
        }

        // Xử lý các dạng lệnh khác nhau
        if (command.includes('đường cao')) {
            return this.createAltitude(pointName, command);
        }
        // Có thể thêm các loại lệnh khác ở đây

        throw new Error('Lệnh không được hỗ trợ hoặc sai cú pháp');
    }

    createAltitude(pointName, command) {
        // Phân tích cú pháp: "AH là đường cao của tam giác ABC"
        const matches = command.match(/([A-Z])([A-Z]) là đường cao của tam giác ([A-Z])([A-Z])([A-Z])/);
        if (!matches) {
            throw new Error('Sai cú pháp. Ví dụ: "AH là đường cao của tam giác ABC"');
        }

        const A = this.model.points.get(matches[1]);
        const B = this.model.points.get(matches[3]);
        const C = this.model.points.get(matches[4]);
        const D = this.model.points.get(matches[5]);

        if (!A || !B || !C || !D) {
            throw new Error('Không tìm thấy các điểm trong tam giác');
        }

        const H = this.geometryCalculator.footOfPerpendicular(A, B, C);
        
        // Vẽ đường cao
        this.threeRenderer.addLine(A, H, 0xff0000, 3);

        return {
            id: pointName,
            ...H
        };
    }

    resetModel() {
        if (confirm('Bạn có chắc muốn xóa toàn bộ mô hình?')) {
            this.threeRenderer.clearAll();
            this.model.points.clear();
            this.model.edges = [];
            this.model.faces = [];
            this.model.annotations = [];
            this.showStatus('Đã xóa toàn bộ mô hình', 'info');
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = message;
        statusEl.className = `status-message status-${type}`;
        
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 5000);
    }

    exportModel() {
        const exportData = {
            metadata: {
                name: 'geometry-model',
                createdAt: new Date().toISOString(),
                units: 'units'
            },
            points: Array.from(this.model.points.values()),
            edges: this.model.edges,
            faces: this.model.faces,
            annotations: this.model.annotations
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'geometry-model.json';
        link.click();
    }

    importModel(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.loadModelData(data);
                this.showStatus('Đã tải mô hình thành công', 'success');
            } catch (error) {
                this.showStatus('Lỗi khi tải file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    loadModelData(data) {
        this.resetModel();
        
        data.points.forEach(point => {
            this.model.points.set(point.id, point);
            this.threeRenderer.addPoint(point, point.id);
        });

        data.edges.forEach(edge => {
            const from = this.model.points.get(edge.from);
            const to = this.model.points.get(edge.to);
            if (from && to) {
                this.threeRenderer.addLine(from, to);
            }
        });
    }
}
