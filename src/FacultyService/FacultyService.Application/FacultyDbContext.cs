using EntityFramework.Exceptions.PostgreSQL;
using FacultyService.Domain;
using FacultyService.Domain.Entity;
using Finbuckle.MultiTenant.Abstractions;
using Finbuckle.MultiTenant.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Registration = FacultyService.Domain.Entity.Registration;

namespace FacultyService.Application;

public partial class FacultyDbContext : DbContext, IMultiTenantDbContext
{
    public required IMultiTenantContextAccessor<AppTenantInfo> MultiTenantContextAccessor { get; init; }

    private readonly IConfiguration _configuration;

    public FacultyDbContext(DbContextOptions<FacultyDbContext> options,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor, IConfiguration configuration)
        : base(options)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(multiTenantContextAccessor);
        ArgumentNullException.ThrowIfNull(configuration);
        MultiTenantContextAccessor = multiTenantContextAccessor;
        TenantInfo = MultiTenantContextAccessor.MultiTenantContext.TenantInfo ??
                     throw new InvalidOperationException("TenantInfo is null");
        TenantMismatchMode = TenantMismatchMode.Throw;
        TenantNotSetMode = TenantNotSetMode.Throw;
        _configuration = configuration;
    }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CreditClass> CreditClasses { get; set; }

    public virtual DbSet<Faculty> Faculties { get; set; }

    public virtual DbSet<GlobalClassCode> GlobalClassCodes { get; set; }

    public virtual DbSet<GlobalStudentCode> GlobalStudentCodes { get; set; }

    public virtual DbSet<Lecturer> Lecturers { get; set; }

    public virtual DbSet<Registration> Registrations { get; set; }

    public virtual DbSet<Student> Students { get; set; }


    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseExceptionProcessor()
                .UseNpgsql(_configuration["ConnectionStrings:DefaultConnection"] ??
                           throw new InvalidOperationException("Connection string is null"))
                .EnableDetailedErrors();
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => new { e.FacultyCode, e.ClassCode }).HasName("pk_class");

            entity.ToTable("class", tb => tb.HasComment("Bảng chứa thông tin các lớp học"));

            entity.HasIndex(e => e.AcademicYearCode, "idx_class_academic_year");

            entity.HasIndex(e => e.ClassName, "idx_class_name");

            entity.Property(e => e.FacultyCode)
                .HasMaxLength(10)
                .HasComment("Mã khoa (FK và cột phân phối)")
                .HasColumnName("faculty_code");
            entity.Property(e => e.ClassCode)
                .HasMaxLength(10)
                .HasComment("Mã lớp")
                .HasColumnName("class_code");
            entity.Property(e => e.AcademicYearCode)
                .HasMaxLength(9)
                .HasComment("Khóa học (ví dụ K60, D2020)")
                .HasColumnName("academic_year_code");
            entity.Property(e => e.ClassName)
                .HasMaxLength(50)
                .HasComment("Tên lớp")
                .HasColumnName("class_name");

            entity.HasOne(d => d.FacultyCodeNavigation).WithMany()
                .HasForeignKey(d => d.FacultyCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_class_faculty");

            entity.HasOne(d => d.GlobalClassCode)
                .WithOne()
                .HasForeignKey<Domain.Entity.Class>(d => new { d.ClassCode, d.ClassName })
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_class_global_code");
        });


        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseCode).HasName("pk_course");

            entity.ToTable("course", tb => tb.HasComment("Bảng chứa thông tin các môn học"));

            entity.HasIndex(e => new { e.LectureCredit, e.LabCredit }, "idx_course_credits");

            entity.HasIndex(e => e.CourseName, "uq_course_name").IsUnique();

            entity.Property(e => e.CourseCode)
                .HasMaxLength(10)
                .HasComment("Mã môn học")
                .HasColumnName("course_code");
            entity.Property(e => e.CourseName)
                .HasMaxLength(50)
                .HasComment("Tên môn học")
                .HasColumnName("course_name");
            entity.Property(e => e.LabCredit)
                .HasComment("Số tín chỉ thực hành")
                .HasColumnName("lab_credit");
            entity.Property(e => e.LectureCredit)
                .HasComment("Số tín chỉ lý thuyết")
                .HasColumnName("lecture_credit");
        });

        modelBuilder.Entity<CreditClass>(entity =>
        {
            entity.HasKey(e => new { e.FacultyCode, e.CreditClassId }).HasName("pk_credit_class");

            entity.ToTable("credit_class", tb => tb.HasComment("Bảng chứa thông tin các lớp tín chỉ"));

            entity.HasIndex(e => new { e.AcademicYear, e.Semester }, "idx_credit_class_academic_term");

            entity.HasIndex(e => e.CourseCode, "idx_credit_class_course");

            entity.HasIndex(e => e.LecturerCode, "idx_credit_class_lecturer");

            entity.HasIndex(e => new { e.AcademicYear, e.Semester, e.CourseCode, e.GroupNumber, e.FacultyCode },
                "uq_credit_class").IsUnique();
            entity.Property(e => e.FacultyCode)
                .HasMaxLength(10)
                .HasComment("Mã khoa quản lý lớp tín chỉ (FK và cột phân phối)")
                .HasColumnName("faculty_code");
            entity.Property(e => e.CreditClassId)
                .ValueGeneratedOnAdd()
                .HasComment("Mã lớp tín chỉ (tự động tăng)")
                .HasColumnName("credit_class_id");
            entity.Property(e => e.AcademicYear)
                .HasMaxLength(9)
                .HasComment("Niên khóa (ví dụ: 2023-2024)")
                .HasColumnName("academic_year");
            entity.Property(e => e.CourseCode)
                .HasMaxLength(10)
                .HasComment("Mã môn học (FK)")
                .HasColumnName("course_code");
            entity.Property(e => e.GroupNumber)
                .HasComment("Nhóm")
                .HasColumnName("group_number");
            entity.Property(e => e.IsCancelled)
                .HasDefaultValue(false)
                .HasComment("Lớp đã bị hủy (TRUE: hủy)")
                .HasColumnName("is_cancelled");
            entity.Property(e => e.LecturerCode)
                .HasMaxLength(10)
                .HasComment("Mã giảng viên (FK)")
                .HasColumnName("lecturer_code");
            entity.Property(e => e.MinStudent)
                .HasDefaultValue((short)1)
                .HasComment("Số sinh viên tối thiểu")
                .HasColumnName("min_student");
            entity.Property(e => e.Semester)
                .HasComment("Học kỳ")
                .HasColumnName("semester");

            entity.HasOne(d => d.CourseCodeNavigation).WithMany(p => p.CreditClasses)
                .HasForeignKey(d => d.CourseCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_credit_class_course");

            entity.HasOne(d => d.FacultyCodeNavigation).WithMany()
                .HasForeignKey(d => d.FacultyCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_credit_class_faculty");

            entity.HasOne(d => d.LecturerCodeNavigation).WithMany(p => p.CreditClasses)
                .HasForeignKey(d => d.LecturerCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_credit_class_lecturer");
        });

        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.HasKey(e => e.FacultyCode).HasName("pk_faculty");

            entity.ToTable("faculty", tb => tb.HasComment("Bảng chứa thông tin các khoa"));

            entity.HasIndex(e => e.FacultyName, "uq_faculty_name").IsUnique();

            entity.Property(e => e.FacultyCode)
                .HasMaxLength(10)
                .HasComment("Mã khoa")
                .HasColumnName("faculty_code");
            entity.Property(e => e.FacultyName)
                .HasMaxLength(50)
                .HasComment("Tên khoa")
                .HasColumnName("faculty_name");
        });

        modelBuilder.Entity<GlobalClassCode>(entity =>
        {
            entity.HasKey(e => new { e.ClassCode, e.ClassName }).HasName("pk_global_class_codes");

            entity.ToTable("global_class_code",
                tb => tb.HasComment("Bảng lưu trữ các mã lớp đã sử dụng để đảm bảo tính duy nhất toàn cục"));

            entity.HasIndex(e => e.ClassName, "uq_global_class_name").IsUnique();

            entity.Property(e => e.ClassCode)
                .HasMaxLength(10)
                .HasComment("Mã lớp (PK)")
                .HasColumnName("class_code");
            entity.Property(e => e.ClassName)
                .HasMaxLength(50)
                .HasComment("Tên lớp (PK)")
                .HasColumnName("class_name");
        });

        modelBuilder.Entity<GlobalStudentCode>(entity =>
        {
            entity.HasKey(e => e.StudentCode).HasName("pk_global_student_codes");

            entity.ToTable("global_student_code",
                tb => tb.HasComment("Bảng lưu trữ các mã sinh viên đã sử dụng để đảm bảo tính duy nhất toàn cục"));

            entity.Property(e => e.StudentCode)
                .HasMaxLength(10)
                .HasComment("Mã sinh viên (PK)")
                .HasColumnName("student_code");
        });

        modelBuilder.Entity<Lecturer>(entity =>
        {
            entity.HasKey(e => e.LecturerCode).HasName("pk_lecturer");

            entity.ToTable("lecturer", tb => tb.HasComment("Bảng chứa thông tin giảng viên"));

            entity.HasIndex(e => e.FacultyCode, "idx_lecturer_faculty");

            entity.HasIndex(e => new { e.LastName, e.FirstName }, "idx_lecturer_name");

            entity.Property(e => e.LecturerCode)
                .HasMaxLength(10)
                .HasComment("Mã giảng viên")
                .HasColumnName("lecturer_code");
            entity.Property(e => e.AcademicRank)
                .HasMaxLength(20)
                .HasComment("Học hàm")
                .HasColumnName("academic_rank");
            entity.Property(e => e.Degree)
                .HasMaxLength(20)
                .HasComment("Học vị")
                .HasColumnName("degree");
            entity.Property(e => e.FacultyCode)
                .HasMaxLength(10)
                .HasComment("Mã khoa (FK)")
                .HasColumnName("faculty_code");
            entity.Property(e => e.FirstName)
                .HasMaxLength(10)
                .HasComment("Tên giảng viên")
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .HasComment("Họ giảng viên")
                .HasColumnName("last_name");
            entity.Property(e => e.Specialization)
                .HasMaxLength(50)
                .HasComment("Chuyên môn")
                .HasColumnName("specialization");

            entity.HasOne(d => d.FacultyCodeNavigation).WithMany()
                .HasForeignKey(d => d.FacultyCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_lecturer_faculty");
        });

        modelBuilder.Entity<Registration>(entity =>
        {
            entity.HasKey(e => new { e.FacultyCode, e.CreditClassId, e.StudentCode }).HasName("pk_registration");

            entity.ToTable("registration",
                tb => tb.HasComment("Bảng chứa thông tin đăng ký lớp tín chỉ của sinh viên"));

            entity.HasIndex(e => new { e.FacultyCode, e.StudentCode }, "idx_registration_student");

            entity.Property(e => e.FacultyCode)
                .HasMaxLength(10)
                .HasComment("Mã khoa (cột phân phối, phần của PK)")
                .HasColumnName("faculty_code");
            entity.Property(e => e.CreditClassId)
                .HasComment("Mã lớp tín chỉ (phần của PK)")
                .HasColumnName("credit_class_id");
            entity.Property(e => e.StudentCode)
                .HasMaxLength(10)
                .HasComment("Mã sinh viên (phần của PK)")
                .HasColumnName("student_code");
            entity.Property(e => e.AttendanceScore)
                .HasComment("Điểm chuyên cần (0-10)")
                .HasColumnName("attendance_score");
            entity.Property(e => e.FinalScore)
                .HasComment("Điểm cuối kỳ (0-10)")
                .HasColumnName("final_score");
            entity.Property(e => e.IsCancelled)
                .HasDefaultValue(false)
                .HasComment("Đăng ký đã bị hủy (TRUE: hủy)")
                .HasColumnName("is_cancelled");
            entity.Property(e => e.MidtermScore)
                .HasComment("Điểm giữa kỳ (0-10)")
                .HasColumnName("midterm_score");

            entity.HasOne(d => d.FacultyCodeNavigation).WithMany()
                .HasForeignKey(d => d.FacultyCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_registration_faculty_dist");

            entity.HasOne(d => d.CreditClass).WithMany(p => p.Registrations)
                .HasForeignKey(d => new { d.FacultyCode, d.CreditClassId })
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_registration_credit_class");

            entity.HasOne(d => d.Student).WithMany(p => p.Registrations)
                .HasForeignKey(d => new { d.FacultyCode, d.StudentCode })
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_registration_student");
        });


        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => new { e.FacultyCode, e.StudentCode }).HasName("pk_student");

            entity.ToTable("student", tb => tb.HasComment("Bảng chứa thông tin sinh viên"));

            entity.HasIndex(e => new { e.LastName, e.FirstName }, "idx_student_name");

            entity.HasIndex(e => e.IsSuspended, "idx_student_status");

            entity.Property(e => e.FacultyCode)
                .HasMaxLength(10)
                .HasComment("Mã khoa của sinh viên (cột phân phối)")
                .HasColumnName("faculty_code");
            entity.Property(e => e.StudentCode)
                .HasMaxLength(10)
                .HasComment("Mã sinh viên")
                .HasColumnName("student_code");
            entity.Property(e => e.Address)
                .HasMaxLength(100)
                .HasComment("Địa chỉ")
                .HasColumnName("address");
            entity.Property(e => e.BirthDate)
                .HasComment("Ngày sinh")
                .HasColumnName("birth_date");
            entity.Property(e => e.ClassCode)
                .HasMaxLength(10)
                .HasComment("Mã lớp")
                .HasColumnName("class_code");
            entity.Property(e => e.FirstName)
                .HasMaxLength(10)
                .HasComment("Tên sinh viên")
                .HasColumnName("first_name");
            entity.Property(e => e.Gender)
                .HasDefaultValue(false)
                .HasComment("Phái (FALSE: Nam, TRUE: Nữ)")
                .HasColumnName("gender");
            entity.Property(e => e.IsSuspended)
                .HasDefaultValue(false)
                .HasComment("Đã nghỉ học (TRUE: nghỉ, FALSE: còn học)")
                .HasColumnName("is_suspended");
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .HasComment("Họ sinh viên")
                .HasColumnName("last_name");

            entity.HasOne(d => d.FacultyCodeNavigation).WithMany()
                .HasForeignKey(d => d.FacultyCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_student_faculty_dist");

            entity.HasOne(d => d.StudentCodeNavigation).WithOne()
                .HasForeignKey<Domain.Entity.Student>(d => d.StudentCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_student_global_code");

            entity.HasOne(d => d.Class).WithMany(p => p.Students)
                .HasForeignKey(d => new { d.FacultyCode, d.ClassCode })
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_student_class");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Faculty>().HasQueryFilter(f => f.FacultyCode == TenantInfo.Id);
        modelBuilder.Entity<Class>().HasQueryFilter(c => c.FacultyCode == TenantInfo.Id);
        modelBuilder.Entity<Lecturer>().HasQueryFilter(l => l.FacultyCode == TenantInfo.Id);
        modelBuilder.Entity<Registration>().HasQueryFilter(r => r.FacultyCode == TenantInfo.Id);
        modelBuilder.Entity<Student>().HasQueryFilter(s => s.FacultyCode == TenantInfo.Id);
        modelBuilder.Entity<CreditClass>().HasQueryFilter(cc => cc.FacultyCode == TenantInfo.Id);
    }

    public ITenantInfo TenantInfo { get; }
    public TenantMismatchMode TenantMismatchMode { get; }
    public TenantNotSetMode TenantNotSetMode { get; }
}