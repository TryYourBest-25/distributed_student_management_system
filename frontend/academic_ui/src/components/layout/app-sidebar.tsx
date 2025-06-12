'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';
import {
  Users,
  BookCopy,
  BookMarked,
  Building,
  LayoutDashboard,
  GraduationCap,
  Settings,
  LucideIcon,
  Home,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[]; // Which roles can see this item
}

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard, roles: [UserRole.PGV, UserRole.KHOA] },
  { href: '/faculties', label: 'Quản lý Khoa', icon: Building, roles: [UserRole.PGV] },
  { href: '/courses', label: 'Môn học', icon: BookCopy, roles: [UserRole.PGV, UserRole.KHOA] },
  { href: '/lecturers', label: 'Giảng viên', icon: Users, roles: [UserRole.PGV, UserRole.KHOA] },
  { href: '/classes', label: 'Lớp học', icon: BookMarked, roles: [UserRole.PGV, UserRole.KHOA] },
  { href: '/credit-classes', label: 'Lớp tín chỉ', icon: GraduationCap, roles: [UserRole.PGV, UserRole.KHOA] },
];

const SidebarSkeleton = () => (
  <Sidebar>
    <SidebarHeader className="p-4">
      <Skeleton className="h-8 w-32" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {[...Array(5)].map((_, i) => (
              <SidebarMenuItem key={i}>
                <div className="flex items-center w-full p-2">
                  <Skeleton className="h-6 w-6 mr-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter className="p-4 border-t">
       <div className="flex items-center w-full p-2">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-4 w-24" />
        </div>
    </SidebarFooter>
  </Sidebar>
)


export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <SidebarSkeleton />;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return null;
  }

  const { user } = session;

  const userRoles = user.roles as UserRole[];

  const accessibleNavItems = allNavItems.filter(item =>
    item.roles.some(role => userRoles.includes(role))
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400 block text-center">
          Hệ thống QLĐT
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {accessibleNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild variant={isActive ? 'default' : undefined} className="w-full justify-start">
                      <Link href={item.href}>
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild variant={pathname === '/settings' ? 'default' : undefined} className="w-full justify-start">
                            <Link href="/settings">
                                <Settings className="mr-2 h-5 w-5" />
                                <span>Cài đặt</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
} 