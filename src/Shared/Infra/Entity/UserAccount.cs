namespace Shared.Infra.Entity;

/// <summary>
/// Bảng chứa thông tin tài khoản người dùng
/// </summary>
public partial class UserAccount
{
    /// <summary>
    /// ID người dùng (tự động tăng)
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Tên đăng nhập
    /// </summary>
    public string Username { get; set; } = null!;

    /// <summary>
    /// Mật khẩu đã được hash
    /// </summary>
    public string PasswordHash { get; set; } = null!;

    /// <summary>
    /// Họ tên đầy đủ
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// Địa chỉ email
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Tài khoản có đang hoạt động không?
    /// </summary>
    public bool? IsActive { get; set; }

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
