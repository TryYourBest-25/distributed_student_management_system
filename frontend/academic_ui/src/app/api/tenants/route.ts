import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Lấy session từ NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    // Gọi API Gateway với access token
    const apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:5000';
    const response = await fetch(`${apiGatewayUrl}/tenants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Gateway error:', response.status, errorText);
      
      // Trả về mock data nếu API Gateway lỗi
      return NextResponse.json([
        {
          id: "CNTT",
          identifier: "IT-FACULTY",
          name: "Công Nghệ Thông Tin"
        },
        {
          id: "DTVT", 
          identifier: "VT-FACULTY",
          name: "Điện Tử Viễn thông"
        }
      ]);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in tenants API route:', error);
    
    // Trả về mock data nếu có lỗi
    return NextResponse.json([
      {
        id: "CNTT",
        identifier: "IT-FACULTY", 
        name: "Công Nghệ Thông Tin"
      }
    ]);
  }
} 