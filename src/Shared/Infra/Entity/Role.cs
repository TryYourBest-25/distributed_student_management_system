namespace Shared.Infra.Entity;

/// <summary>
/// Bảng định nghĩa các vai trò trong hệ thống
/// </summary>
public partial class Role
{
    /// <summary>
    /// ID vai trò (tự động tăng)
    /// </summary>
    public int RoleId { get; set; }

    /// <summary>
    /// Tên vai trò (ví dụ: PGV, KHOA, SV, PKT)
    /// </summary>
    public string RoleName { get; set; } = null!;

    /// <summary>
    /// Mô tả vai trò
    /// </summary>
    public string? Description { get; set; }

    public virtual ICollection<UserAccount> Users { get; set; } = new List<UserAccount>();
}
