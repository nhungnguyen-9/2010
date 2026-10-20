# Gửi những bông hoa của MindX · 20/10/2026

Món quà nhỏ nhân Ngày Phụ nữ Việt Nam 20/10 dành cho những người phụ nữ tuyệt vời của MindX: một phong thư mở ra thành bó hoa, lời chúc chung từ cả nhà và một "vườn hoa" với lá thư riêng cho từng người.

Trang web hoàn toàn tĩnh (HTML, CSS, JavaScript thuần), không cần cài đặt hay build. Hoa được vẽ bằng SVG/Canvas, nhạc nền hộp nhạc được tạo trực tiếp bằng Web Audio API (không dùng file nhạc), mặc định tắt và chỉ phát khi người xem bấm bật.

## Mở trên máy

- Cách nhanh nhất: nhấp đúp vào `index.html` để mở bằng trình duyệt.
- Hoặc chạy một máy chủ tĩnh trong thư mục dự án:

  ```bash
  python3 -m http.server 8000
  ```

  rồi mở `http://localhost:8000`.

## Đưa lên mạng miễn phí

### GitHub Pages

1. Tạo một repository mới trên GitHub (ví dụ `mindx-2010`).
2. Tải lên `index.html`, thư mục `css/`, thư mục `js/` (và `README.md` nếu muốn).
3. Vào **Settings → Pages**, ở mục **Build and deployment** chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, bấm **Save**.
4. Sau khoảng 1–2 phút, trang sẽ có địa chỉ dạng `https://<tên-tài-khoản>.github.io/mindx-2010/`.

### Netlify Drop

1. Mở https://app.netlify.com/drop.
2. Kéo thả cả thư mục dự án (chứa `index.html`, `css/`, `js/`) vào trang.
3. Netlify sẽ tạo ngay một địa chỉ dạng `https://<tên-ngẫu-nhiên>.netlify.app`. Có thể đổi tên miền con trong phần cài đặt site.

## Link riêng cho từng người

Thêm đuôi `?to=<mã>` vào địa chỉ trang. Người nhận sẽ thấy phong thư ghi "Gửi [Tên]", và sau khi mở quà sẽ được đưa thẳng đến lá thư của mình, rồi có thể xem cả vườn hoa.

Ví dụ: `https://<tên-miền>/?to=tuyet-nhu`

| Tên | Đuôi link |
|---|---|
| Lan Anh | `?to=lan-anh` |
| Tuyết Như | `?to=tuyet-nhu` |
| Trúc Ly | `?to=truc-ly` |
| Vân Anh | `?to=van-anh` |
| Ánh | `?to=anh` |
| Anh Thư | `?to=anh-thu` |
| Phương Mai | `?to=phuong-mai` |
| Thu Hương | `?to=thu-huong` |
| Kim Dung | `?to=kim-dung` |
| Ngọc Phát | `?to=ngoc-phat` |
| Lan Thanh | `?to=lan-thanh` |
| Mỹ Duyên | `?to=my-duyen` |
| Thanh Nhàn | `?to=thanh-nhan` |

- Dạng `#<mã>` cũng dùng được, ví dụ `https://<tên-miền>/#my-duyen`.
- Mã không có trong danh sách (ví dụ `?to=abc`) sẽ hiển thị trang chung, không báo lỗi.
- Trong mỗi lá thư có nút **Sao chép link riêng** để lấy nhanh đường link của người đó.

## Chỉnh sửa lời chúc

Toàn bộ tên, loài hoa, bảng màu, câu tagline và lời chúc nằm trong `js/data.js`. Sửa trực tiếp nội dung trong dấu nháy và giữ nguyên `slug` để các link riêng không bị thay đổi.

## Ghi chú

- Nhạc nền được tạo bằng Web Audio API, mặc định tắt. Người xem có thể bật bằng nút "Mở quà kèm nhạc nhẹ" ở phong thư hoặc nút nốt nhạc ở góc phải dưới màn hình.
- Phông chữ (Dancing Script, Playfair Display, Be Vietnam Pro) được tải từ Google Fonts và hỗ trợ đầy đủ tiếng Việt. Khi không có mạng, trang vẫn hiển thị đúng dấu bằng phông của hệ thống.
- Muốn có ảnh xem trước khi gửi link qua Zalo/Messenger: sau khi đưa trang lên mạng, thêm một ảnh (ví dụ `og.png`, 1200×630) vào dự án và thêm dòng sau vào phần `<head>` của `index.html`, thay bằng địa chỉ thật:

  ```html
  <meta property="og:image" content="https://<tên-miền>/og.png">
  ```
