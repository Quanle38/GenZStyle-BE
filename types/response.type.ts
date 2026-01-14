// Dùng cho API KHÔNG phân trang
export interface MessageResponse<T> {
  message: string;
  data: T | null;
}

// Dùng cho API CÓ phân trang
export interface PaginationResponse<T> {
  currentPage: number;
  totalPage: number;
  totalUser: number;
  data: T[];
}
