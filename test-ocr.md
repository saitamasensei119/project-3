# Hướng dẫn Test Chức năng OCR Hóa đơn

## Chuẩn bị
1. Backend đang chạy trên http://localhost:5000
2. Frontend đang chạy trên http://localhost:5173
3. Đã cài đặt Tesseract.js cho OCR

## Các bước test

### 1. Test API OCR trực tiếp
Sử dụng Postman hoặc curl để test API:

```bash
curl -X POST \
  http://localhost:5000/api/ocr/test \
  -H 'Content-Type: multipart/form-data' \
  -F 'invoice=@path/to/your/invoice.jpg'
```

### 2. Test qua frontend
1. Mở http://localhost:5173 trên trình duyệt
2. Đăng nhập vào ứng dụng
3. Đi đến tab "Giao dịch"
4. Nhấn nút "📷 Đọc hóa đơn"
5. Tải lên ảnh hóa đơn
6. Chờ xử lý OCR
7. Kiểm tra thông tin được điền tự động vào form

### 3. Các loại hóa đơn có thể test
- Hóa đơn siêu thị (Big C, Co.opmart, Vinmart)
- Hóa đơn nhà hàng
- Hóa đơn cửa hàng tiện lợi
- Hóa đơn dịch vụ

## Các thông tin OCR có thể trích xuất
- Số tiền (amount)
- Ngày tháng (date)
- Tên nhà cung cấp (vendor)
- Mô tả (description)

## Lưu ý khi test
- Ảnh cần rõ nét, không bị mờ
- Chữ cần đủ lớn để OCR có thể đọc
- Hóa đơn tiếng Việt sẽ có độ chính xác thấp hơn tiếng Anh
- Có thể cần chỉnh sửa thông tin sau khi OCR trích xuất

## Xử lý lỗi thường gặp
1. **Lỗi upload file**: Kiểm tra định dạng file (JPEG, PNG, BMP, TIFF)
2. **Lỗi OCR**: Thử với ảnh chất lượng cao hơn
3. **Lỗi kết nối**: Kiểm tra backend đang chạy
4. **Thông tin sai**: Chỉnh sửa lại thông tin trong form

## Tính năng đã triển khai
✅ Upload ảnh hóa đơn
✅ OCR trích xuất văn bản
✅ Phân tích thông tin hóa đơn
✅ Tự động điền form
✅ Xử lý lỗi và validation
✅ Responsive UI
✅ Progress indicator
