using System;
using System.Collections.Generic;

namespace TuitionService.Domain.Entity;

/// <summary>
/// Bảng lưu trữ các mã sinh viên đã sử dụng để đảm bảo tính duy nhất toàn cục
/// </summary>
public partial class GlobalStudentCode
{
    /// <summary>
    /// Mã sinh viên (PK)
    /// </summary>
    public string StudentCode { get; set; } = null!;

    public StudentBasicInfo? StudentBasicInfo { get; set; }
}