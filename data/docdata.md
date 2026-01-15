1. Mục đích thiết kế

Cơ sở dữ liệu được thiết kế nhằm phục vụ cho ứng dụng quản lý tài chính cá nhân, cho phép người dùng:

Quản lý thu nhập, chi tiêu và tiết kiệm

Phân loại giao dịch theo danh mục

Thiết lập ngân sách theo tháng

Theo dõi mục tiêu tài chính

Lưu trữ và khai thác các phân tích, gợi ý từ AI

Hệ quản trị cơ sở dữ liệu sử dụng: PostgreSQL

2. Tổng quan các bảng dữ liệu

Hệ thống gồm 6 bảng chính:

STT	Tên bảng	    Chức năng
1	users	        Lưu thông tin người dùng
2	categories	    Quản lý danh mục thu / chi / tiết kiệm
3	transactions	Lưu các giao dịch tài chính
4	budgets	        Quản lý ngân sách theo tháng
5	ai_insights	    Lưu kết quả phân tích tài chính từ AI
6	goals	        Quản lý mục tiêu tài chính cá nhân
3. Mô tả chi tiết từng bảng
3.1. Bảng users

Chức năng:
Lưu trữ thông tin tài khoản và các thiết lập cá nhân của người dùng.

Tên cột	           Kiểu dữ liệu	Mô tả
user_id	           SERIAL (PK)	    Khóa chính, định danh người dùng
name	           VARCHAR(100)	Tên người dùng
email              VARCHAR(150)	Email đăng nhập (duy nhất)
password	       VARCHAR(200)	Mật khẩu đã mã hóa
currency	       VARCHAR(10)	Đơn vị tiền tệ (mặc định VND)
language	       VARCHAR(20)	Ngôn ngữ sử dụng
ai_insight_enabled BOOLEAN	Bật/tắt tính năng AI
created_at	TIMESTAMP	Thời điểm tạo tài khoản
3.2. Bảng categories

Chức năng:
Bảng categories dùng để quản lý các danh mục thu nhập, chi tiêu và tiết kiệm trong hệ thống.
Hệ thống hỗ trợ hai loại danh mục:

Danh mục mặc định của hệ thống (dùng chung cho tất cả người dùng)

Danh mục do người dùng tự tạo (phục vụ nhu cầu cá nhân)

Việc phân tách này giúp tăng tính linh hoạt, tránh trùng lặp dữ liệu và nâng cao trải nghiệm người dùng.

Cấu trúc bảng
Tên cột	Kiểu dữ liệu	Mô tả
category_id	SERIAL (PK)	Khóa chính, định danh danh mục
user_id	INTEGER (FK)	Tham chiếu đến bảng users, cho phép NULL đối với danh mục mặc định
name	VARCHAR(100)	Tên danh mục
type	VARCHAR(20)	Loại danh mục: income, expense, saving
icon	VARCHAR(100)	Biểu tượng đại diện cho danh mục
is_default	BOOLEAN	Xác định danh mục mặc định của hệ thống

Quan hệ

Một người dùng có thể tạo nhiều danh mục cá nhân

Một danh mục có thể được sử dụng trong nhiều giao dịch

Các danh mục mặc định có thể được chia sẻ giữa nhiều người dùng

3.3. Bảng transactions

Chức năng:
Lưu trữ các giao dịch tài chính phát sinh của người dùng.

Tên cột	Kiểu dữ liệu	Mô tả
transaction_id	SERIAL (PK)	Khóa chính
user_id	INTEGER (FK)	Người thực hiện giao dịch
type	VARCHAR(20)	Loại giao dịch (income, expense, saving)
amount	NUMERIC(15,2)	Số tiền giao dịch
category_id	INTEGER (FK)	Danh mục giao dịch
note	TEXT	Ghi chú
date	DATE	Ngày giao dịch
ai_category	VARCHAR(100)	Danh mục gợi ý bởi AI
is_ai_predicted	BOOLEAN	Đánh dấu AI phân loại
created_at	TIMESTAMP	Thời điểm tạo
updated_at	TIMESTAMP	Thời điểm cập nhật
3.4. Bảng budgets

Chức năng:
Quản lý ngân sách chi tiêu của người dùng theo tháng và danh mục.

Tên cột	Kiểu dữ liệu	Mô tả
budget_id	SERIAL (PK)	Khóa chính
user_id	INTEGER (FK)	Người thiết lập ngân sách
month	INTEGER	Tháng áp dụng
year	INTEGER	Năm áp dụng
category_id	INTEGER (FK)	Danh mục áp dụng
limit_amount	NUMERIC(15,2)	Hạn mức ngân sách
spent_amount	NUMERIC(15,2)	Số tiền đã chi

Ghi chú:
spent_amount được cập nhật định kỳ nhằm tăng hiệu năng truy vấn.

3.5. Bảng ai_insights

Chức năng:
Lưu trữ các kết quả phân tích tài chính do hệ thống AI sinh ra theo từng tháng.

Tên cột	Kiểu dữ liệu	Mô tả
insight_id	SERIAL (PK)	Khóa chính
user_id	INTEGER (FK)	Người dùng
month	INTEGER	Tháng phân tích
year	INTEGER	Năm phân tích
top_spending_categories	JSONB	Danh mục chi tiêu nhiều nhất
overspending_alerts	JSONB	Cảnh báo vượt ngân sách
saving_recommendations	JSONB	Gợi ý tiết kiệm
trend_analysis	JSONB	Phân tích xu hướng
created_at	TIMESTAMP	Thời điểm tạo
3.6. Bảng goals

Chức năng:
Quản lý các mục tiêu tài chính cá nhân của người dùng.

Tên cột	Kiểu dữ liệu	Mô tả
goal_id	SERIAL (PK)	Khóa chính
user_id	INTEGER (FK)	Người đặt mục tiêu
title	VARCHAR(200)	Tên mục tiêu
target_amount	NUMERIC(15,2)	Số tiền mục tiêu
current_amount	NUMERIC(15,2)	Số tiền hiện tại
deadline	DATE	Thời hạn
created_at	TIMESTAMP	Ngày tạo
4. Quan hệ giữa các bảng

users – categories: 1–N

users – transactions: 1–N

categories – transactions: 1–N

users – budgets: 1–N

users – goals: 1–N

users – ai_insights: 1–N