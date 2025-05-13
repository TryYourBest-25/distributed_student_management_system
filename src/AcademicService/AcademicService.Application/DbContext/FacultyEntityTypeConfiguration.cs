using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Shared.Infra.Entity;

namespace AcademicService.Application.DbContext;

public class FacultyEntityTypeConfiguration : IEntityTypeConfiguration<FacultyEf>
{
    public void Configure(EntityTypeBuilder<FacultyEf> builder)
    {
        builder.ToTable("faculty", tb => tb.HasComment("Bảng chứa thông tin các khoa"));
        builder.HasKey(e => e.FacultyCode)
            .HasName("PRIMARY");

        builder.Property(c => c.FacultyCode)
            .HasMaxLength(10)
            .IsFixedLength()
            .IsRequired()
            .HasComment("Mã khoa")
            .HasColumnName("faculty_code");

        builder.Property(c => c.FacultyName)
            .HasMaxLength(50)
            .IsRequired()
            .HasComment("Tên khoa")
            .HasColumnName("faculty_name");
    }
}