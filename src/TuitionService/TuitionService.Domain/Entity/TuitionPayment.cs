using System;
using System.Collections.Generic;

namespace TuitionService.Domain.Entity;

/// <summary>
/// Bảng chi tiết các lần đóng học phí của sinh viên
/// </summary>
public partial class TuitionPayment
{
    /// <summary>
    /// Mã sinh viên (FK)
    /// </summary>
    public string StudentCode { get; set; } = null!;

    /// <summary>
    /// Niên khóa (FK)
    /// </summary>
    public string AcademicYear { get; set; } = null!;

    /// <summary>
    /// Học kỳ (FK)
    /// </summary>
    public int Semester { get; set; }

    /// <summary>
    /// Ngày đóng tiền
    /// </summary>
    public DateOnly PaymentDate { get; set; }

    /// <summary>
    /// Số tiền đã đóng
    /// </summary>
    public int AmountPaid { get; set; }

    public Tuition Tuition { get; set; } = null!;
}