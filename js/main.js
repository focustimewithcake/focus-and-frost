class GeometryLearningApp {
    constructor() {
        this.geometryCalculator = new GeometryCalculator();
        this.threeRenderer = new ThreeJSRenderer('canvas3d');
        this.uiHandler = new UIHandler(this.geometryCalculator, this.threeRenderer);
        
        this.init();
    }

    init() {
        console.log('Geometry Learning App initialized');
        
        // Hiển thị hướng dẫn ban đầu
        this.uiHandler.showStatus(
            'Chọn loại hình và dạng đáy, rồi bấm "Tạo mô hình". Sau đó thêm điểm/đường theo ý muốn.',
            'info'
        );

        // Thêm các tính năng mở rộng
        this.addExportImport();
    }

    addExportImport() {
        // Có thể thêm nút export/import vào UI
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export Model';
        exportBtn.className = 'btn btn-secondary';
        exportBtn.style.marginLeft = '10px';
        exportBtn.addEventListener('click', () => this.uiHandler.exportModel());
        
        document.querySelector('.header-content').appendChild(exportBtn);

        // Import input (có thể ẩn)
        const importInput = document.createElement('input');
        importInput.type = 'file';
        importInput.accept = '.json';
        importInput.style.display = 'none';
        importInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.uiHandler.importModel(e.target.files[0]);
            }
        });
        
        const importBtn = document.createElement('button');
        importBtn.textContent = 'Import Model';
        importBtn.className = 'btn btn-secondary';
        importBtn.style.marginLeft = '10px';
        importBtn.addEventListener('click', () => importInput.click());
        
        document.querySelector('.header-content').appendChild(importBtn);
        document.body.appendChild(importInput);
    }
}

// Khởi chạy ứng dụng khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    new GeometryLearningApp();
});
