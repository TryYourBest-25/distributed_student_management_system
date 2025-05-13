using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shared.Infra.Entity;

namespace AcademicService.Application.DbContext;

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