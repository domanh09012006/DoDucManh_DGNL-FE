# BÀI LÀM – ĐÁNH GIÁ NĂNG LỰC FRONTEND (K24)

- **Mã đề:** 01
- **Họ tên: Đỗ Đức Mạnh**
- **Lớp: HN-K24-CNTT2**
- **Link repository: https://github.com/domanh09012006/DoDucManh_DGNL-FE**
- **Hệ điều hành (Windows/macOS): Window**
- **Mã commit P2 đã nộp trước phút 90 (gõ `git log --oneline -1`): 30b7ad269f944ecb9fe45941571876acfa9afbc6**
- **Phiên bản Node.js (gõ `node -v`): v26.13.1**

## 4.1. Giao diện danh sách sản phẩm

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin. Đánh dấu `[x]` vào các mục đã làm để tự kiểm tra.

- [ ] 4.1.1. Bố cục trang
- [ ] 4.1.2. Bảng sản phẩm
- [ ] 4.1.3. Định dạng dữ liệu
- [ ] 4.1.4. Hiển thị trên điện thoại

## 4.2. Thêm, sửa, xoá sản phẩm qua API

> Pha 1 – mức AI-0 (không dùng AI).

> Chấm trực tiếp trên mã nguồn thư mục officemart_admin.

- [ ] 4.2.1. Tải danh sách
- [ ] 4.2.2. Form thêm sản phẩm
- [ ] 4.2.3. Gửi form
- [ ] 4.2.4. Sửa sản phẩm
- [ ] 4.2.5. Xoá sản phẩm

## 4.3. Tìm kiếm, lọc và phân trang

> Pha 2 – mức AI-2 (được dùng AI, ghi nhật ký ở Mục 4.3.5).

> Mục 4.3.1 đến 4.3.3 và ý c của Mục 4.3.4 chấm trực tiếp trên mã nguồn.

- [ ] 4.3.1. Tìm kiếm và lọc
- [ ] 4.3.2. Phân trang
- [ ] 4.3.3. Đồng bộ URL

### 4.3.4. Phản biện mã do AI sinh

#### a) Thao tác làm danh sách hiển thị sai

Các bước thao tác:

```text
1. Chạy mock API ở chế độ chậm bằng lệnh `npm run api:cham` và mở trang danh sách sản phẩm (`npm run dev`).
2. Tạm gắn trang danh sách dùng hook mẫu `src/ai/useProductSearch_ai.js`.
3. Tại ô tìm kiếm, gõ từ khoá "ban" (trên `api:cham`, request GET /api/products với `q` bắt đầu bằng "ban" bị làm chậm 2,5 giây).
4. Ngay sau khi request "ban" vừa gửi đi (trước khi hết 2,5 giây), xoá nhanh ô tìm kiếm và gõ "chuot" (request này chỉ mất 0,1 giây).
5. Đợi khoảng 2,5 giây để cả hai request hoàn tất và quan sát bảng sản phẩm trên màn hình.
```

Kết quả hiển thị:

```text
Sau khoảng 0,1 giây, bảng hiển thị đúng danh sách các sản phẩm "Chuột..." (Chuột không dây, Chuột gaming...). Tuy nhiên khoảng 2,4 giây sau đó, bảng tự động bị ghi đè thành danh sách các sản phẩm khớp với "ban" (Bàn làm việc..., Bàn phím...), trong khi ô tìm kiếm và URL vẫn đang là "chuot".
```

Kết quả đúng:

```text
Màn hình chỉ được hiển thị danh sách sản phẩm khớp với từ khoá cuối cùng là "chuot" (các sản phẩm Chuột...), kết quả của request "ban" cũ hơn phải bị huỷ hoặc bị bỏ qua, không được ghi đè lên giao diện.
```

#### b) Vì sao hook hiển thị sai

Hook `useProductSearch_ai.js` gặp lỗi tranh chấp bất đồng bộ (Race Condition) vì `useEffect` gọi `api.get('/products', { params })` nhưng không có `AbortController` để huỷ request cũ hay biến cờ bỏ qua response lỗi thời khi `params` thay đổi. Khi người dùng đổi nhanh từ `"ban"` (mất 2,5 giây) sang `"chuot"` (mất 0,1 giây), response của `"chuot"` về trước và cập nhật state trước, sau đó response của `"ban"` mới về sau và gọi `setData` / `setTotal` ghi đè lên kết quả mới.

#### c) Hook đã sửa

> Chấm trực tiếp trên file src/hooks/useProductSearch.js và trang danh sách.

### 4.3.5. Nhật ký dùng AI (giữ – sửa – loại bỏ)

> Ghi ít nhất 2 lần dùng AI có ảnh hưởng đến mã nộp. Không dùng AI trong Pha 2 thì xoá bảng và ghi "Không sử dụng AI trong Pha 2".

| Lần | Câu lệnh chính gửi cho AI | Đoạn mã hoặc ý AI đưa ra (file) | Quyết định (giữ/sửa/loại bỏ) | Lý do | Bằng chứng kiểm chứng (chạy thử gì, kết quả) |
|---|---|---|---|---|---|
| 1 | Viết custom hook `useProductSearch` gọi `/api/products` theo `q`, `category`, `status`, `page`, xử lý chống race condition khi gõ tìm kiếm nhanh. | Gợi ý dùng `useEffect` gọi `api.get('/products')` kết hợp `AbortController` (`src/hooks/useProductSearch.js`). | Sửa | Giữ ý dùng `AbortController` và cleanup `controller.abort()`, nhưng sửa lại để `trim()` từ khoá (`trimmedQ`), truyền thêm `limit` và `reload`, bỏ qua lỗi `CanceledError` / `ERR_CANCELED` khi request cũ bị huỷ và chuẩn hoá thông báo lỗi tiếng Việt. | Chạy `npm run api:cham` + `npm run dev`, gõ `"ban"` rồi xoá ngay gõ `"chuot"`: request `"ban"` bị huỷ (canceled), bảng chỉ hiển thị danh sách `"Chuột..."` và không bị ghi đè sau 2,5 giây. |
| 2 | Hướng dẫn đồng bộ từ khoá tìm kiếm, bộ lọc và số trang lên URL bằng `useSearchParams` có debounce 400ms. | Gợi ý dùng `useSearchParams` với `setTimeout` 400ms để cập nhật URL `q`, `category`, `status`, `page` (`src/pages/ProductListPage.jsx`). | Sửa | Giữ cơ chế `useSearchParams` và debounce 400ms, nhưng sửa bổ sung hàm `parsePositivePage` để chặn `page` âm/không hợp lệ trên URL, dùng `buildSearchParams` bỏ qua `q` rỗng/toàn khoảng trắng và chỉ reset về trang 1 khi người dùng đổi bộ lọc/từ khoá. | Gõ từ khoá, chọn danh mục/trạng thái, chuyển trang rồi bấm F5 tải lại trang trên trình duyệt: URL giữ đúng query params và bảng hiển thị đúng trang/bộ lọc tương ứng. |

## Ghi chú (không tính điểm)

Các trường hợp biên đã xử lý trong mã nguồn (`src/hooks/useProductSearch.js` và `src/pages/ProductListPage.jsx`):
- **Từ khoá chỉ có khoảng trắng (ví dụ `"   "`):** Trong `ProductListPage.jsx`, `searchText.trim() === ''` được chuẩn hoá thành `''` và `buildSearchParams` không đưa `q` lên URL; đồng thời trong `useProductSearch.js`, `trimmedQ = String(q ?? '').trim()` luôn cắt khoảng trắng trước khi gửi query `q` lên API nên vẫn trả về đầy đủ danh sách sản phẩm.
- **Số trang trên URL âm, bằng 0 hoặc không phải số (ví dụ `?page=-3`, `?page=abc`):** Hàm `parsePositivePage` trong `ProductListPage.jsx` kiểm tra định dạng số nguyên dương (`/^\d+$/` và `parsed >= 1`), nếu không hợp lệ sẽ tự động đưa về trang `1`.
- **Số trang trên URL vượt quá tổng số trang (ví dụ `?page=999`):** Khi bấm nút chuyển trang hoặc sau khi xoá phần tử cuối cùng của trang hiện tại, `handlePageChange` giới hạn `safePage = Math.max(1, Math.min(totalPages, nextPage))`. Nếu người dùng gõ trực tiếp `?page=999` trên thanh địa chỉ, giao diện hiển thị trạng thái trống (`Không tìm thấy sản phẩm phù hợp.`), khoá nút `Trang sau` (`urlPage >= totalPages`), và khi bấm `Trang trước` sẽ kẹp về đúng trang cuối cùng hợp lệ (`totalPages`).
