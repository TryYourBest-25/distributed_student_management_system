export interface PagedList<T> {
  indexFrom: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
} 