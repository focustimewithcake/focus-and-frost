// Biến toàn cục
let scene, camera, renderer, controls;
let currentShape = null;
let points = {};
let lines = [];
let pointLabels = [];
let lineLabels = [];

// Khởi tạo scene
function init() {
    // Tạo scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // Tạo camera
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    // Tạo renderer
    const container = document.getElementById('scene-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Thêm điều khiển camera
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Thêm ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    scene.add(directionalLight);
    
    // Vẽ trục tọa độ
    drawCoordinateAxes();
    
    // Xử lý sự kiện resize
    window.addEventListener('resize', onWindowResize);
    
    // Gán sự kiện cho các nút
    document.getElementById('createShape').addEventListener('click', createShape);
    document.getElementById('resetScene').addEventListener('click', resetScene);
    document.getElementById('addPoint').addEventListener('click', addSpecialPoint);
    document.getElementById('addLine').addEventListener('click', addSpecialLine);
    
    // Cập nhật giao diện tham số
    document.getElementById('pointType').addEventListener('change', updatePointParams);
    document.getElementById('lineType').addEventListener('change', updateLineParams);
    
    // Khởi tạo giao diện tham số
    updatePointParams();
    updateLineParams();
    
    // Bắt đầu animation loop
    animate();
}

// Vẽ trục tọa độ
function drawCoordinateAxes() {
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
}

// Tạo hình dạng được chọn
function createShape() {
    const shapeType = document.getElementById('shapeType').value;
    const baseType = document.getElementById('baseType').value;
    const size = parseFloat(document.getElementById('size').value);
    
    // Xóa hình cũ nếu có
    if (currentShape) {
        scene.remove(currentShape);
        currentShape = null;
    }
    
    // Xóa các điểm và đường đặc biệt
    clearSpecialPointsAndLines();
    
    // Tạo hình mới
    switch(shapeType) {
        case 'tetrahedron':
            currentShape = createTetrahedron(baseType, size);
            break;
        case 'prism':
            currentShape = createPrism(baseType, size);
            break;
        case 'cuboid':
            currentShape = createCuboid(baseType, size);
            break;
        case 'cube':
            currentShape = createCube(baseType, size);
            break;
    }
    
    if (currentShape) {
        scene.add(currentShape);
        updateCoordinatesInfo();
    }
}

// Xóa các điểm và đường đặc biệt
function clearSpecialPointsAndLines() {
    // Xóa các điểm đặc biệt
    for (const pointName in points) {
        if (points[pointName].userAdded) {
            scene.remove(points[pointName].mesh);
        }
    }
    
    // Xóa các đường đặc biệt
    for (const line of lines) {
        scene.remove(line);
    }
    
    // Xóa các nhãn
    for (const label of pointLabels) {
        scene.remove(label);
    }
    for (const label of lineLabels) {
        scene.remove(label);
    }
    
    // Reset mảng
    points = {};
    lines = [];
    pointLabels = [];
    lineLabels = [];
}

// Reset toàn bộ scene
function resetScene() {
    // Xóa hình hiện tại
    if (currentShape) {
        scene.remove(currentShape);
        currentShape = null;
    }
    
    // Xóa các điểm và đường đặc biệt
    clearSpecialPointsAndLines();
    
    // Cập nhật thông tin tọa độ
    updateCoordinatesInfo();
    
    // Reset camera
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    controls.reset();
}

// Thêm điểm đặc biệt
function addSpecialPoint() {
    const pointName = document.getElementById('pointName').value.trim();
    const pointType = document.getElementById('pointType').value;
    
    if (!pointName) {
        alert('Vui lòng nhập tên điểm!');
        return;
    }
    
    if (points[pointName]) {
        alert(`Điểm ${pointName} đã tồn tại!`);
        return;
    }
    
    let pointPosition;
    
    switch(pointType) {
        case 'midpoint':
            const point1 = document.getElementById('midpointPoint1').value;
            const point2 = document.getElementById('midpointPoint2').value;
            
            if (!points[point1] || !points[point2]) {
                alert('Vui lòng chọn các điểm hợp lệ!');
                return;
            }
            
            pointPosition = calculateMidpoint(points[point1].position, points[point2].position);
            break;
            
        case 'centroid':
            const pointA = document.getElementById('centroidPointA').value;
            const pointB = document.getElementById('centroidPointB').value;
            const pointC = document.getElementById('centroidPointC').value;
            
            if (!points[pointA] || !points[pointB] || !points[pointC]) {
                alert('Vui lòng chọn các điểm hợp lệ!');
                return;
            }
            
            pointPosition = calculateCentroid(
                points[pointA].position, 
                points[pointB].position, 
                points[pointC].position
            );
            break;
            
        case 'foot':
            const basePoint = document.getElementById('footBasePoint').value;
            const linePoint1 = document.getElementById('footLinePoint1').value;
            const linePoint2 = document.getElementById('footLinePoint2').value;
            
            if (!points[basePoint] || !points[linePoint1] || !points[linePoint2]) {
                alert('Vui lòng chọn các điểm hợp lệ!');
                return;
            }
            
            pointPosition = calculateFootOfPerpendicular(
                points[basePoint].position,
                points[linePoint1].position,
                points[linePoint2].position
            );
            break;
            
        default:
            alert('Vui lòng chọn loại điểm!');
            return;
    }
    
    // Thêm điểm vào scene
    const pointGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
    pointMesh.position.copy(pointPosition);
    scene.add(pointMesh);
    
    // Thêm nhãn cho điểm
    addPointLabel(pointName, pointPosition);
    
    // Lưu thông tin điểm
    points[pointName] = {
        position: pointPosition,
        mesh: pointMesh,
        userAdded: true
    };
    
    // Cập nhật thông tin tọa độ
    updateCoordinatesInfo();
    
    // Reset form
    document.getElementById('pointName').value = '';
}

// Thêm đường đặc biệt
function addSpecialLine() {
    const lineType = document.getElementById('lineType').value;
    
    let linePoints = [];
    let lineColor;
    
    switch(lineType) {
        case 'altitude':
            const vertex = document.getElementById('altitudeVertex').value;
            const basePoint1 = document.getElementById('altitudeBasePoint1').value;
            const basePoint2 = document.getElementById('altitudeBasePoint2').value;
            
            if (!points[vertex] || !points[basePoint1] || !points[basePoint2]) {
                alert('Vui lòng chọn các điểm hợp lệ!');
                return;
            }
            
            const foot = calculateFootOfPerpendicular(
                points[vertex].position,
                points[basePoint1].position,
                points[basePoint2].position
            );
            
            linePoints = [points[vertex].position, foot];
            lineColor = 0x00ff00; // Màu xanh lá
            break;
            
        case 'median':
            const medianVertex = document.getElementById('medianVertex').value;
            const medianOpposite = document.getElementById('medianOpposite').value;
            
            if (!points[medianVertex] || !points[medianOpposite]) {
                alert('Vui lòng chọn các điểm hợp lệ!');
                return;
            }
            
            linePoints = [points[medianVertex].position, points[medianOpposite].position];
            lineColor = 0x0000ff; // Màu xanh dương
            break;
            
        case 'bisector':
            // Giả lập - trong thực tế cần tính toán phức tạp hơn
            const angleVertex = document.getElementById('bisectorVertex').value;
            const point1 = document.getElementById('bisectorPoint1').value;
            const point2 = document.getElementById('bisectorPoint2').value;
            
            if (!points[angleVertex] || !points[point1] || !points[point2]) {
                alert('Vui lòng chọn các điểm hợp lệ!');
                return;
            }
            
            // Giả sử đường phân giác đi qua trung điểm của cạnh đối diện
            const midpoint = calculateMidpoint(points[point1].position, points[point2].position);
            linePoints = [points[angleVertex].position, midpoint];
            lineColor = 0xff00ff; // Màu hồng
            break;
            
        case 'perpendicular':
            const midPoint = document.getElementById('perpendicularMidpoint').value;
            const linePt1 = document.getElementById('perpendicularLinePoint1').value;
            const linePt2 = document.getElementById('perpendicularLinePoint2').value;
            
            if (!points[midPoint] || !points[linePt1] || !points[linePt2]) {
                alert('Vui lòng chọn các điểm hợp lệ!');
                return;
            }
            
            // Tính vector của đường thẳng
            const lineVector = new THREE.Vector3().subVectors(
                points[linePt2].position, 
                points[linePt1].position
            ).normalize();
            
            // Tìm điểm trên đường trung trực cách xa điểm giữa
            const perpendicularPoint = new THREE.Vector3().copy(points[midPoint].position)
                .add(lineVector.clone().cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(3));
            
            linePoints = [
                points[midPoint].position.clone().add(
                    lineVector.clone().cross(new THREE.Vector3(0, 1, 0)).multiplyScalar(-3)
                ),
                perpendicularPoint
            ];
            lineColor = 0xffff00; // Màu vàng
            break;
            
        default:
            alert('Vui lòng chọn loại đường!');
            return;
    }
    
    // Vẽ đường
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, linewidth: 2 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    lines.push(line);
    
    // Thêm nhãn cho đường
    addLineLabel(lineType, linePoints[0], linePoints[1]);
    
    // Cập nhật thông tin tọa độ
    updateCoordinatesInfo();
}

// Cập nhật giao diện tham số cho điểm
function updatePointParams() {
    const pointType = document.getElementById('pointType').value;
    const paramsContainer = document.getElementById('pointParams');
    paramsContainer.innerHTML = '';
    
    switch(pointType) {
        case 'midpoint':
            paramsContainer.innerHTML = `
                <label for="midpointPoint1">Điểm thứ nhất:</label>
                <input type="text" id="midpointPoint1" placeholder="A">
                <label for="midpointPoint2">Điểm thứ hai:</label>
                <input type="text" id="midpointPoint2" placeholder="B">
            `;
            break;
            
        case 'centroid':
            paramsContainer.innerHTML = `
                <label for="centroidPointA">Điểm A:</label>
                <input type="text" id="centroidPointA" placeholder="A">
                <label for="centroidPointB">Điểm B:</label>
                <input type="text" id="centroidPointB" placeholder="B">
                <label for="centroidPointC">Điểm C:</label>
                <input type="text" id="centroidPointC" placeholder="C">
            `;
            break;
            
        case 'foot':
            paramsContainer.innerHTML = `
                <label for="footBasePoint">Điểm cần kẻ đường vuông góc:</label>
                <input type="text" id="footBasePoint" placeholder="A">
                <label for="footLinePoint1">Điểm thứ nhất của đường thẳng:</label>
                <input type="text" id="footLinePoint1" placeholder="B">
                <label for="footLinePoint2">Điểm thứ hai của đường thẳng:</label>
                <input type="text" id="footLinePoint2" placeholder="C">
            `;
            break;
    }
}

// Cập nhật giao diện tham số cho đường
function updateLineParams() {
    const lineType = document.getElementById('lineType').value;
    const paramsContainer = document.getElementById('lineParams');
    paramsContainer.innerHTML = '';
    
    switch(lineType) {
        case 'altitude':
            paramsContainer.innerHTML = `
                <label for="altitudeVertex">Đỉnh tam giác:</label>
                <input type="text" id="altitudeVertex" placeholder="A">
                <label for="altitudeBasePoint1">Điểm thứ nhất của cạnh đáy:</label>
                <input type="text" id="altitudeBasePoint1" placeholder="B">
                <label for="altitudeBasePoint2">Điểm thứ hai của cạnh đáy:</label>
                <input type="text" id="altitudeBasePoint2" placeholder="C">
            `;
            break;
            
        case 'median':
            paramsContainer.innerHTML = `
                <label for="medianVertex">Đỉnh tam giác:</label>
                <input type="text" id="medianVertex" placeholder="A">
                <label for="medianOpposite">Điểm giữa cạnh đối diện:</label>
                <input type="text" id="medianOpposite" placeholder="M">
            `;
            break;
            
        case 'bisector':
            paramsContainer.innerHTML = `
                <label for="bisectorVertex">Đỉnh góc:</label>
                <input type="text" id="bisectorVertex" placeholder="A">
                <label for="bisectorPoint1">Điểm thứ nhất trên cạnh:</label>
                <input type="text" id="bisectorPoint1" placeholder="B">
                <label for="bisectorPoint2">Điểm thứ hai trên cạnh:</label>
                <input type="text" id="bisectorPoint2" placeholder="C">
            `;
            break;
            
        case 'perpendicular':
            paramsContainer.innerHTML = `
                <label for="perpendicularMidpoint">Trung điểm đoạn thẳng:</label>
                <input type="text" id="perpendicularMidpoint" placeholder="M">
                <label for="perpendicularLinePoint1">Điểm thứ nhất của đoạn thẳng:</label>
                <input type="text" id="perpendicularLinePoint1" placeholder="A">
                <label for="perpendicularLinePoint2">Điểm thứ hai của đoạn thẳng:</label>
                <input type="text" id="perpendicularLinePoint2" placeholder="B">
            `;
            break;
    }
}

// Thêm nhãn cho điểm
function addPointLabel(name, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 32;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 20px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    sprite.position.copy(position);
    sprite.position.y += 0.3; // Đặt nhãn cao hơn điểm một chút
    sprite.scale.set(1, 0.5, 1);
    
    scene.add(sprite);
    pointLabels.push(sprite);
}

// Thêm nhãn cho đường
function addLineLabel(type, start, end) {
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 30;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 16px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    let labelText = '';
    switch(type) {
        case 'altitude': labelText = 'Đường cao'; break;
        case 'median': labelText = 'Trung tuyến'; break;
        case 'bisector': labelText = 'Phân giác'; break;
        case 'perpendicular': labelText = 'Trung trực'; break;
    }
    
    context.fillText(labelText, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    sprite.position.copy(midpoint);
    sprite.position.y += 0.3;
    sprite.scale.set(2, 0.6, 1);
    
    scene.add(sprite);
    lineLabels.push(sprite);
}

// Cập nhật thông tin tọa độ
function updateCoordinatesInfo() {
    const coordinatesDiv = document.getElementById('coordinates');
    coordinatesDiv.innerHTML = '';
    
    for (const pointName in points) {
        const position = points[pointName].position;
        const pointDiv = document.createElement('div');
        pointDiv.className = 'point-info';
        pointDiv.innerHTML = `
            <strong>${pointName}:</strong> (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})
        `;
        coordinatesDiv.appendChild(pointDiv);
    }
}

// Xử lý sự kiện resize
function onWindowResize() {
    const container = document.getElementById('scene-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Khởi tạo ứng dụng khi trang được tải
window.addEventListener('DOMContentLoaded', init);
