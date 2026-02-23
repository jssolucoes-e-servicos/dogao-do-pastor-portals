export interface IPaginatedData<T> {
  data: T[],
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  }
};