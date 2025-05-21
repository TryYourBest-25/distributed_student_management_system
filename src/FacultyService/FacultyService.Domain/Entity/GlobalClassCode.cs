namespace FacultyService.Domain.Entity;

/// <summary>
/// Bảng lưu trữ các mã lớp đã sử dụng để đảm bảo tính duy nhất toàn cục
/// </summary>
public partial class GlobalClassCode
{
    /// <summary>
    /// Mã lớp (PK)
    /// </summary>
    public string ClassCode { get; set; } = null!;

    /// <summary>
    /// Tên lớp (PK)
    /// </summary>
    public string ClassName { get; set; } = null!;

}
