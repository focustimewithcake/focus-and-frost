// Đây là NHÀ BẾP - nơi nấu đồ ăn AI
const express = require('express');
const app = express();
app.use(require('cors')());

// Món đặc biệt: SƠ ĐỒ TƯ DUY
app.post('/nau-an', (req, res) => {
    const order = req.body.order;
    console.log('🛎️ Khách order:', order);
    
    // Nấu món ăn AI
    res.json({
        monAn: 'SƠ ĐỒ TƯ DUY SIÊU NGON',
        thanhPhan: ['Chủ đề chính', 'Nhánh 1', 'Nhánh 2', 'Nhánh 3']
    });
});

// Mở cửa hàng lúc 8h sáng (port 3001)
app.listen(3001, () => {
    console.log('🍳 NHÀ BẾP ĐÃ MỞ CỬA!');
    console.log('📍 Địa chỉ: http://localhost:3001');
});
