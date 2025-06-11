import StudentTable from '@/components/students/StudentTable';
import AppBreadcrumb, { type BreadcrumbItem } from '@/components/layout/AppBreadcrumb';

export default function HomePage() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Trang chủ" },
  ];

  return (
    <div className="p-4 md:p-6">
      <AppBreadcrumb items={breadcrumbItems} />
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Danh sách Sinh viên</h1>
      <StudentTable />
    </div>
  );
}
