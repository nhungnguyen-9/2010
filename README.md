# Gửi những bông hoa của MindX · 20/10/2026

Món quà nhỏ nhân Ngày Phụ nữ Việt Nam 20/10 dành cho những người phụ nữ tuyệt vời của MindX: một phong thư mở ra thành bó hoa, một lời chúc chung và một "vườn hoa" với lá thư riêng cho từng người.

Mọi lời chúc đều được viết như thư **ẩn danh**, không ký tên người gửi và không đứng tên công ty. Thư ký "— Từ một người luôn trân trọng bạn —", phần lời chúc chung ký "— Một người giấu tên —". MindX chỉ được nhắc đến như nơi các bạn làm việc ("những bông hoa của MindX", "Vườn hoa MindX").

Trang web hoàn toàn tĩnh (HTML, CSS, JavaScript thuần), không cần cài đặt hay build. Hoa được vẽ bằng SVG/Canvas. Bài hát nền là **NIKI – You'll Be In My Heart**, tự phát ngay khi mở trang và lặp lại khi hết bài.

## Cấu trúc thư mục

```
index.html
css/style.css
js/            data.js (tên, hoa, lời chúc), flowers.js, effects.js, music.js, main.js
img/           ảnh từng người, đặt tên theo mã: lan-anh.jpg, tuyet-nhu.jpg, ...
audio/         youll-be-in-my-heart.m4a (bài hát nền)
```

- **Ảnh** (`img/<mã>.jpg`) hiển thị ở "vườn hoa" bên ngoài và trên con tem của phong thư khi mở bằng link riêng. Bên trong lá thư vẫn là bông hoa hợp với tên, kèm dòng "Ý nghĩa loài hoa". Muốn đổi ảnh, chỉ cần thay file cùng tên (ảnh vuông, khoảng 300×300 px là đẹp). Tên file chỉ dùng chữ thường không dấu và dấu gạch ngang để chạy đúng trên GitHub Pages/Netlify. Nếu một ảnh bị lỗi, thẻ đó tự hiện bông hoa thay thế.
- **Nhạc** (`audio/youll-be-in-my-heart.m4a`): trang thử phát nhạc ngay khi vừa mở (âm lượng nhỏ dần lên). Phần lớn trình duyệt (Chrome, Safari, iPhone, trình duyệt trong Zalo/Messenger) chặn tự phát nhạc có tiếng cho đến khi người xem chạm vào trang. Khi đó nhạc sẽ bắt đầu ở lần chạm, bấm hay gõ phím đầu tiên ở bất kỳ đâu, thường chính là lúc bấm **Mở quà**. Hết bài thì nhạc tự phát lại từ đầu. Nút đĩa nhạc ở góc phải dưới (có sẵn từ màn hình phong thư) dùng để tạm dừng hoặc bật lại. Đã tạm dừng thì nhạc không tự phát lại khi chạm vào trang nữa. Nhạc tự dừng khi chuyển sang tab khác và phát tiếp khi quay lại. Trên iPhone, âm lượng đi theo nút âm lượng của máy (iOS không cho trang web chỉnh âm lượng).

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
2. Tải lên `index.html` và các thư mục `css/`, `js/`, `img/`, `audio/` (có thể bỏ qua `.agents/`).
3. Vào **Settings → Pages**, ở mục **Build and deployment** chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, bấm **Save**.
4. Sau khoảng 1–2 phút, trang sẽ có địa chỉ dạng `https://<tên-tài-khoản>.github.io/mindx-2010/`.

### Netlify Drop

1. Mở https://app.netlify.com/drop.
2. Kéo thả cả thư mục dự án (chứa `index.html`, `css/`, `js/`, `img/`, `audio/`) vào trang.
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

Toàn bộ tên, đường dẫn ảnh, loài hoa, ý nghĩa loài hoa, bảng màu, câu tagline và lời chúc nằm trong `js/data.js`. Sửa trực tiếp nội dung trong dấu nháy và giữ nguyên `slug` để các link riêng không bị thay đổi.

## Ghi chú

- **Bản quyền bài hát:** "You'll Be In My Heart" (bản NIKI) là tác phẩm có bản quyền. File nhạc chỉ dùng cho món quà riêng tư này. Nếu đưa trang lên mạng công khai, chỉ gửi link riêng cho những người nhận, không chia sẻ rộng hay quảng bá. Muốn chia sẻ công khai thì nên xoá thư mục `audio/` (trang sẽ tự ẩn nút nhạc nếu không tải được bài hát, không báo lỗi).
- Trang có ảnh thật của từng người, nên cũng chỉ nên gửi link cho đúng những người trong danh sách.
- Phông chữ (Dancing Script, Playfair Display, Be Vietnam Pro) được tải từ Google Fonts và hỗ trợ đầy đủ tiếng Việt. Khi không có mạng, trang vẫn hiển thị đúng dấu bằng phông của hệ thống.
- Muốn có ảnh xem trước khi gửi link qua Zalo/Messenger: sau khi đưa trang lên mạng, thêm một ảnh (ví dụ `og.png`, 1200×630) vào dự án và thêm dòng sau vào phần `<head>` của `index.html`, thay bằng địa chỉ thật:

  ```html
  <meta property="og:image" content="https://<tên-miền>/og.png">
  ```
