import { RowData } from '@tanstack/react-table';

// This allows us to pass meta information (like event handlers or permissions)
// to cells and headers in a type-safe way.
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    canManage?: boolean;
    editHandler?: (rowData: TData) => void;
    deleteHandler?: (rowData: TData) => void;
    viewDetailsHandler?: (rowData: TData) => void;
    // Add any other custom meta properties you need
  }
}

// Re-exporting a more specific type for convenience if needed, though direct use of TableMeta is fine.
export interface AppTableMeta<TData extends RowData> {
  canManage?: boolean;
  editHandler?: (rowData: TData) => void;
  deleteHandler?: (rowData: TData) => void;
  viewDetailsHandler?: (rowData: TData) => void;
} 