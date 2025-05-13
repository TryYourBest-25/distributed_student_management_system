using AcademicService.Domain.ValueObject;
using EntityFramework.Exceptions.PostgreSQL;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.Configuration;
using Shared.Infra.Entity;

namespace AcademicService.Application.DbContext;

public partial class AcademicDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    private IConfiguration _configuration;

    public AcademicDbContext(IConfiguration configuration)
    {
        _configuration = configuration;
        base.ChangeTracker.LazyLoadingEnabled = false;
        base.Database.EnsureCreated();
    }

    public AcademicDbContext(DbContextOptions<AcademicDbContext> options, IConfiguration configuration)
        : base(options)
    {
        _configuration = configuration;
    }

    public virtual DbSet<CourseEf> Courses { get; set; }

    public virtual DbSet<FacultyEf> Faculties { get; set; }

    public virtual DbSet<LecturerEf> Lecturers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (optionsBuilder.IsConfigured) return;
        var connectionString = _configuration["AcademicService:ConnectionStrings:DefaultConnection"] ??
                               throw new InvalidOperationException("Không thể tìm thấy chuỗi kết nối");
        optionsBuilder.UseExceptionProcessor().UseNpgsql(connectionString)
            .EnableSensitiveDataLogging()
            .EnableDetailedErrors();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        new CourseEntityTypeConfiguration().Configure(modelBuilder.Entity<CourseEf>());

        modelBuilder.Entity<FacultyEf>(entity =>
        {
            entity.HasKey(e => e.FacultyCode).HasName("PRIMARY");

            entity.ToTable("faculty", tb => tb.HasComment("Bảng chứa thông tin các khoa"));

            entity.HasIndex(e => e.FacultyName, "faculty_name").IsUnique();

            entity.Property(c => c.FacultyCode)
                .HasMaxLength(10)
                .IsFixedLength()
                .HasComment("Mã khoa")
                .HasColumnName("faculty_code");
            entity.Property(e => e.FacultyName)
                .HasMaxLength(50)
                .HasComment("Tên khoa")
                .HasColumnName("faculty_name");
        });

        modelBuilder.Entity<LecturerEf>(entity =>
        {
            entity.HasKey(e => e.LecturerCode).HasName("PRIMARY");

            entity.ToTable("lecturer", tb => tb.HasComment("Bảng chứa thông tin giảng viên"));

            entity.HasIndex(e => e.FacultyCode, "fk_lecturer_faculty");

            entity.Property(e => e.LecturerCode)
                .HasMaxLength(10)
                .IsFixedLength()
                .HasComment("Mã giảng viên")
                .IsRequired()
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
                .IsFixedLength()
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

            entity.HasOne(d => d.FacultyCodeNavigation).WithMany(p => p.Lecturers)
                .HasForeignKey(d => d.FacultyCode)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_lecturer_faculty");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

public class CourseEntityTypeConfiguration : IEntityTypeConfiguration<CourseEf>
{
    public void Configure(EntityTypeBuilder<CourseEf> builder)
    {
        builder.ToTable("course", tb => tb.HasComment("Bảng chứa thông tin các môn học"));
        builder.HasKey(e => e.CourseCode )
            .HasName("PRIMARY");
        
        builder.Property(c => c.CourseCode)
            .HasMaxLength(10)
            .IsFixedLength()
            .IsRequired()
            .HasComment("Mã môn học")
            .HasColumnName("course_code");

        builder.Property(e => e.CourseName)
            .HasMaxLength(50)
            .HasComment("Tên môn học")
            .IsRequired()
            .HasColumnName("course_name");

        builder.Property(v => v.LectureCredit)
            .HasComment("Số tiết thực hành")
            .IsRequired()
            .HasColumnName("lab_credit");

        builder.Property(v => v.LabCredit)
            .HasComment("Số tiết lý thuyết")
            .IsRequired()
            .HasColumnName("lecture_credit");
    }
}