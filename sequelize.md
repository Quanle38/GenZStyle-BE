1.findAll() : Lấy toàn bộ bảng ghi và có thể WHERE LIMIT OFFSET ORDER,........
2.findOne() : Lấy một bảng ghi đầu tiên 
3.findByPk() : Tìm theo khóa chính 
4.create(data) : Tạo bảng ghi mới
5.bulkCreate([data]) : Tạo nhiều bảng ghi
6.update(data, {where}) : Cập nhật bảng ghi theo điều kiện 
7.destroy({where}) : Xóa bảng ghi theo điều kiện 
8.save() : hàm lưu thay đổi của instances

//*Nâng cao*//
1.findAndCountAll() : lấy danh sách và cộng tổng số lượng dùng cho pagination
2.findOrCreate({where}) : Tìm nếu không có thì tạo và trả về bảng ghi mới
3.upsert(data) : insert nếu chưa có hoặc update nếu đã có rồi
4.increment(tên_field,{by : 1, where}) : tăng giá trị 
5.decrement(tên_field, by : 1) : giảm giá trị

Toán tử	Mô tả
[Op.eq]	Bằng (=)
[Op.ne]	Khác (!=)
[Op.gt], [Op.gte]	Lớn hơn, ≥
[Op.lt], [Op.lte]	Nhỏ hơn, ≤
[Op.in], [Op.notIn]	Trong, không trong
[Op.like]	Giống (LIKE)
[Op.or], [Op.and]	Hoặc, và

Loại	    Mô tả	   Sequelize method
One-to-One	1 - 1	    hasOne, belongsTo
One-to-Many	1 - nhiều	hasMany, belongsTo
Many-to-Many nhiều - nhiều	belongsToMany (cần bảng trung gian)