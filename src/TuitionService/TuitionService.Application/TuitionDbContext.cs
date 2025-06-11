using System;
using System.Collections.Generic;
using EntityFramework.Exceptions.PostgreSQL;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TuitionService.Domain.Entity;

namespace TuitionService.Domain;

public partial class TuitionDbContext(DbContextOptions<TuitionDbContext> options, IConfiguration configuration)
    : DbContext(options)
{
    public virtual DbSet<StudentBasicInfo> StudentBasicInfos { get; set; }

    public virtual DbSet<Tuition> Tuitions { get; set; }

    public virtual DbSet<TuitionPayment> TuitionPayments { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseExceptionProcessor()
                .UseNpgsql(configuration.GetConnectionString("DefaultConnection") ??
                           throw new InvalidOperationException("Connection string 'DefaultConnection' not found."))
                .EnableDetailedErrors()
                .EnableSensitiveDataLogging();
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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


        modelBuilder.Entity<StudentBasicInfo>(entity =>
        {
            entity.HasKey(e => e.StudentCode).HasName("pk_student_basic_info");

            entity.ToTable("student_basic_info",
                tb => tb.HasComment("Bảng chứa thông tin cơ bản của sinh viên cho phòng kế toán (bản sao)"));

            entity.HasIndex(e => e.ClassCode, "idx_student_basic_info_class");

            entity.HasIndex(e => e.FacultyCode, "idx_student_basic_info_faculty");

            entity.HasIndex(e => new { e.LastName, e.FirstName }, "idx_student_basic_info_name");

            entity.Property(e => e.StudentCode)
                .HasMaxLength(10)
                .HasComment("Mã sinh viên (PK)")
                .HasColumnName("student_code");
            entity.Property(e => e.ClassCode)
                .HasMaxLength(10)
                .HasComment("Mã lớp gốc của sinh viên")
                .HasColumnName("class_code");
            entity.Property(e => e.FacultyCode)
                .HasMaxLength(10)
                .HasComment("Mã khoa gốc của sinh viên")
                .HasColumnName("faculty_code");
            entity.Property(e => e.FirstName)
                .HasMaxLength(10)
                .HasComment("Tên sinh viên")
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .HasComment("Họ sinh viên")
                .HasColumnName("last_name");
        });

        modelBuilder.Entity<Tuition>(entity =>
        {
            entity.HasKey(e => new { e.StudentCode, e.AcademicYear, e.Semester }).HasName("pk_tuition");

            entity.ToTable("tuition", tb => tb.HasComment("Bảng chứa thông tin học phí phải đóng của sinh viên"));

            entity.HasIndex(e => new { e.AcademicYear, e.Semester }, "idx_tuition_academic_term");

            entity.Property(e => e.StudentCode)
                .HasMaxLength(10)
                .HasComment("Mã sinh viên (FK)")
                .HasColumnName("student_code");
            entity.Property(e => e.AcademicYear)
                .HasMaxLength(9)
                .HasComment("Niên khóa")
                .HasColumnName("academic_year");
            entity.Property(e => e.Semester)
                .HasComment("Học kỳ")
                .HasColumnName("semester");
            entity.Property(e => e.TuitionFee)
                .HasComment("Học phí phải đóng")
                .HasColumnName("tuition_fee");

            entity.HasOne(d => d.StudentCodeNavigation).WithMany(p => p.Tuitions)
                .HasForeignKey(d => d.StudentCode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_tuition_student");
        });

        modelBuilder.Entity<TuitionPayment>(entity =>
        {
            entity.HasKey(e => new { e.StudentCode, e.AcademicYear, e.Semester, e.PaymentDate })
                .HasName("pk_tuition_payment");

            entity.ToTable("tuition_payment", tb => tb.HasComment("Bảng chi tiết các lần đóng học phí của sinh viên"));

            entity.HasIndex(e => e.PaymentDate, "idx_tuition_payment_date");

            entity.HasIndex(e => new { e.StudentCode, e.AcademicYear, e.Semester }, "idx_tuition_payment_student_term");

            entity.Property(e => e.StudentCode)
                .HasMaxLength(10)
                .HasComment("Mã sinh viên (FK)")
                .HasColumnName("student_code");
            entity.Property(e => e.AcademicYear)
                .HasMaxLength(9)
                .HasComment("Niên khóa (FK)")
                .HasColumnName("academic_year");
            entity.Property(e => e.Semester)
                .HasComment("Học kỳ (FK)")
                .HasColumnName("semester");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasComment("Ngày đóng tiền")
                .HasColumnName("payment_date");
            entity.Property(e => e.AmountPaid)
                .HasComment("Số tiền đã đóng")
                .HasColumnName("amount_paid");

            entity.HasOne(d => d.Tuition).WithMany(p => p.TuitionPayments)
                .HasForeignKey(d => new { d.StudentCode, d.AcademicYear, d.Semester })
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_payment_tuition");
        });


        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}