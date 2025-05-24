using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shared.Infra.Entity;

namespace AcademicService.Application.DbContext;

public class LecturerEntityTypeConfiguration : IEntityTypeConfiguration<Lecturer>
{
    public void Configure(EntityTypeBuilder<Lecturer> builder)
    {
        builder.ToTable("lecturer", tb => tb.HasComment("Bảng chứa thông tin giảng viên"));
        builder.HasKey(e => e.LecturerCode)
            .HasName("PRIMARY");

        builder.Property(c => c.LecturerCode)
            .HasMaxLength(10)
            .IsFixedLength()
            .IsRequired()
            .HasComment("Mã giảng viên")
            .HasColumnName("lecturer_code");

        builder.Property(c => c.AcademicRank)
            .HasMaxLength(20)
            .HasComment("Học hàm")
            .HasColumnName("academic_rank");

        builder.Property(c => c.Degree)
            .HasMaxLength(20)
            .HasComment("Học vị")
            .HasColumnName("degree");

        builder.Property(c => c.FacultyCode)
            .HasMaxLength(10)
            .IsFixedLength()
            .IsRequired()
            .HasComment("Mã khoa (FK)")
            .HasColumnName("faculty_code");

        builder.Property(c => c.FirstName)
            .HasMaxLength(10)
            .IsRequired()
            .HasComment("Tên giảng viên")
            .HasColumnName("first_name");

        builder.Property(c => c.LastName)
            .HasMaxLength(50)
            .IsRequired()
            .HasComment("Họ giảng viên")
            .HasColumnName("last_name");

        builder.Property(c => c.Specialization)
            .HasMaxLength(50)
            .IsRequired()
            .HasComment("Chuyên môn")
            .HasColumnName("specialization");
    }
}