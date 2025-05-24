using EntityFramework.Exceptions.PostgreSQL;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Shared.Infra.Entity;

namespace AcademicService.Application.DbContext;

public partial class AcademicDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    private readonly IConfiguration _configuration;

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

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<Faculty> Faculties { get; set; }

    public virtual DbSet<Lecturer> Lecturers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (optionsBuilder.IsConfigured) return;
        var connectionString = _configuration["ConnectionStrings:DefaultConnection"] ??
                               throw new InvalidOperationException("Không thể tìm thấy chuỗi kết nối");
        optionsBuilder.UseExceptionProcessor().UseNpgsql(connectionString)
            .EnableSensitiveDataLogging()
            .EnableDetailedErrors();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        new CourseEntityTypeConfiguration().Configure(modelBuilder.Entity<Course>());
        new FacultyEntityTypeConfiguration().Configure(modelBuilder.Entity<Faculty>());
        new LecturerEntityTypeConfiguration().Configure(modelBuilder.Entity<Lecturer>());

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}