using System.Data;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Asp.Versioning;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Gridify;
using Gridify.EntityFramework;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Shared.FileHelper;
using Shared.Infra.StreamHelper;
using TuitionService.Api.Controllers.Request;
using TuitionService.Application.IoDto;
using TuitionService.Domain;
using TuitionService.Domain.Aggregate;
using TuitionService.Domain.Entity;
using TuitionService.Domain.ValueObject;
using ILogger = Microsoft.Extensions.Logging.ILogger;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory())
    .ConfigureContainer<ContainerBuilder>(containerBuilder => { }).UseSerilog((context, provider, configuration) =>
    {
        configuration.ReadFrom.Configuration(context.Configuration);
    });

builder.Services.Configure<RouteOptions>(options =>
    {
        options.LowercaseUrls = true;
        options.LowercaseQueryStrings = true;
    }).AddProblemDetails()
    .AddExceptionHandler<ExceptionHandler>()
    .AddOpenApiDocument()
    .AddDbContext<TuitionDbContext>()
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = new HeaderApiVersionReader("X-Api-Version");
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Configuration.SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.shared.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.shared.{builder.Environment.EnvironmentName}.json", optional: true,
        reloadOnChange: true)
    .AddJsonFile($"tenants.{builder.Environment.EnvironmentName}.json", optional: true,
        reloadOnChange: true)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .AddUserSecrets<Program>();

var app = builder.Build();

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestPath", httpContext.Request.Path);
        diagnosticContext.Set("RequestMethod", httpContext.Request.Method);
        diagnosticContext.Set("RequestQueryString", httpContext.Request.QueryString);
        diagnosticContext.Set("RequestBody", httpContext.Request.Body);
        diagnosticContext.Set("RequestHeaders", httpContext.Request.Headers);
        diagnosticContext.Set("RequestHost", httpContext.Request.Host);
    };
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUi();
    app.UseDeveloperExceptionPage();
    Serilog.Debugging.SelfLog.Enable(Console.Error);
}

var versionSet = app.NewApiVersionSet()
    .HasApiVersion(new ApiVersion(1, 0))
    .ReportApiVersions()
    .Build();

var group = app.MapGroup("/api/v{version:apiVersion}")
    .WithApiVersionSet(versionSet);

app.UseHttpsRedirection();

app.UseExceptionHandler();


app.MapControllers();

app.Run();

group.MapPut("/students/batch", async (List<StudentBasicInfoRequest> request, TuitionDbContext db, ILogger logger) =>
    {
        var students = request.Select(s => new StudentBasicInfoAg(s.StudentCode)
        {
            FirstName = s.FirstName,
            LastName = s.LastName,
            ClassCode = s.ClassCode,
            FacultyCode = s.FacultyCode
        }).Select(r => new StudentBasicInfo
        {
            StudentCode = r.Id.Value,
            FirstName = r.FirstName.Value,
            LastName = r.LastName.Value,
            ClassCode = r.ClassCode.Value,
            FacultyCode = r.FacultyCode.Value
        }).DistinctBy(s => s.StudentCode).ToList();

        try
        {
            await using var transaction = await db.Database.BeginTransactionAsync();

            var updated = await db.StudentBasicInfos
                .Where(s => students.Select(s => s.StudentCode).Contains(s.StudentCode)).ExecuteUpdateAsync(s => s
                    .SetProperty(s => s.FirstName, s => s.FirstName)
                    .SetProperty(s => s.LastName, s => s.LastName)
                    .SetProperty(s => s.ClassCode, s => s.ClassCode)
                    .SetProperty(s => s.FacultyCode, s => s.FacultyCode));

            var studentsToAdd = await db.StudentBasicInfos
                .Where(s => !students.Select(s => s.StudentCode).Contains(s.StudentCode)).ToListAsync();

            await db.StudentBasicInfos.AddRangeAsync(studentsToAdd);

            await db.SaveChangesAsync();

            await transaction.CommitAsync();

            return Results.Ok();
        }
        catch (Exception e)
        {
            logger.LogError(e, "Lỗi khi tạo mới danh sách sinh viên");
            await db.Database.RollbackTransactionAsync();
            throw;
        }

        return Results.Ok();
    })
    .WithName("CreateStudentBatch")
    .WithTags("Students")
    .Produces(StatusCodes.Status200OK)
    .Accepts<List<StudentBasicInfoRequest>>("application/json")
    .WithDescription("Tạo mới danh sách sinh viên");

group.MapPost("/students/tuitions",
        async (RequiredTuitionStudentRequest request, TuitionDbContext db, ILogger logger) =>
        {
            var tuition = new TuitionAg(new TuitionAgId(request.StudentCode, request.AcademicYear, request.Semester));

            var student =
                await db.StudentBasicInfos.FirstOrDefaultAsync(s => s.StudentCode == tuition.Id.StudentCode) ??
                throw new ResourceNotFoundException($"Sinh viên không tồn tại: {request.StudentCode}");

            var newTuition = new Tuition
            {
                StudentCode = tuition.Id.StudentCode,
                AcademicYear = tuition.Id.AcademicYear,
                Semester = tuition.Id.Semester,
                TuitionFee = request.TuitionFee
            };

            await db.Tuitions.AddAsync(newTuition);

            await db.SaveChangesAsync();

            return Results.Ok();
        }).WithName("CreateTuition")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .Accepts<RequiredTuitionStudentRequest>("application/json")
    .WithDescription("Tạo mới học phí cho sinh viên");

group.MapGet("/students",
        async ([FromQuery(Name = "page")] int page, [FromQuery(Name = "size")] int size, TuitionDbContext db,
            ILogger logger) =>
        {
            var query = await db.StudentBasicInfos.AsNoTracking().ToPagedListAsync(page, size);

            return Results.Ok(query);
        }).WithName("SearchStudent")
    .WithTags("Students")
    .Produces<Paging<StudentBasicInfo>>(StatusCodes.Status200OK)
    .WithDescription("Tìm kiếm sinh viên");


group.MapGet("/students/{studentCode}/tuitions", async (string studentCode, TuitionDbContext db, ILogger logger) =>
    {
        var tuition = await db.Tuitions.Where(t => t.StudentCode == studentCode).ToListAsync();

        return Results.Ok(tuition);
    }).WithName("GetTuition")
    .WithTags("Tuition")
    .Produces<Tuition>(StatusCodes.Status200OK)
    .WithDescription("Lấy học phí của sinh viên");

group.MapDelete("/students/{studentCode}/tuitions",
        async (string studentCode, List<DeleteStudentTuitionRequest> request, TuitionDbContext db, ILogger logger) =>
        {
            var tuitions = await db.Tuitions.Where(t =>
                t.StudentCode == studentCode &&
                request.Any(r => r.AcademicYear == t.AcademicYear && r.Semester == t.Semester)).ToListAsync();
            db.Tuitions.RemoveRange(tuitions);

            await db.SaveChangesAsync();

            return Results.Ok();
        }).WithName("DeleteTuition")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .Accepts<List<DeleteStudentTuitionRequest>>("application/json")
    .WithDescription("Xóa học phí của sinh viên");

group.MapGet("/students/{studentCode}/tuitions/search", async ([FromRoute] string studentCode,
        [FromQuery(Name = "filter")] string filter, [FromQuery(Name = "orderBy")] string orderBy,
        [FromQuery(Name = "page")] int page, [FromQuery(Name = "pageSize")] int pageSize, TuitionDbContext db,
        ILogger logger) =>
    {
        var query = await db.Tuitions.Where(t => t.StudentCode == studentCode).AsNoTracking()
            .GridifyAsync(new GridifyQuery(page, pageSize, filter, orderBy));

        return Results.Ok(query);
    }).WithName("SearchTuition")
    .WithTags("Tuition")
    .Produces<Paging<Tuition>>(StatusCodes.Status200OK)
    .WithDescription("Tìm kiếm học phí của sinh viên");


group.MapPut("/students/{studentCode}/tuitions/{academicYear}/{semester}/payments", async (
        [FromRoute] string studentCode, [FromRoute] string academicYear, [FromRoute] int semester,
        [FromQuery] DateOnly paymentDate, [FromQuery] int amountPaid, TuitionDbContext db, ILogger logger) =>
    {
        var money = new Money(amountPaid);
        var semesterRequest = new Semester(semester);
        var academicYearRequest = new AcademicYearCode(academicYear);

        var tuition =
            await db.Tuitions.Include(t => t.TuitionPayments).Where(t =>
                    t.StudentCode == studentCode && t.AcademicYear == academicYearRequest &&
                    t.Semester == semesterRequest)
                .FirstOrDefaultAsync() ??
            throw new ResourceNotFoundException($"Không tìm thấy học phí: {studentCode} {academicYear} {semester}");

        var payment = tuition.TuitionPayments.FirstOrDefault(t => t.PaymentDate == paymentDate);

        if (payment is null)
        {
            var totalPaid = tuition.TuitionPayments.Sum(t => t.AmountPaid);

            if (totalPaid + money.Value > tuition.TuitionFee)
            {
                throw new BadInputException("Số tiền thanh toán vượt quá số tiền học phí");
            }

            var newPayment = new TuitionPayment
            {
                StudentCode = studentCode,
                AcademicYear = academicYear,
                Semester = semesterRequest,
                PaymentDate = paymentDate,
                AmountPaid = money.Value
            };

            tuition.TuitionPayments.Add(newPayment);

            await db.SaveChangesAsync();

            return Results.Ok();
        }

        payment.AmountPaid = money.Value;

        await db.SaveChangesAsync();

        return Results.Ok();
    }).WithName("CreateTuitionPayment")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .WithDescription("Thanh toán học phí của sinh viên");

group.MapDelete("/students/{studentCode}/tuitions/{academicYear}/{semester}/payments",
        async ([FromRoute] string studentCode, [FromBody] List<DeleteTuitionPaymentRequest> request,
            TuitionDbContext db, ILogger logger) =>
        {
            var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            var tuitions = await db.TuitionPayments.Where(t => t.StudentCode == studentCode && request.Any(r =>
                    r.AcademicYear == t.AcademicYear && r.Semester == t.Semester && r.PaymentDate == t.PaymentDate))
                .ExecuteDeleteAsync();

            await transaction.CommitAsync();

            return Results.Ok(tuitions);
        }).WithName("DeleteTuitionPayment")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .Accepts<List<DeleteTuitionPaymentRequest>>("application/json")
    .WithDescription("Xóa học phí của sinh viên");

group.MapGet("/tuitions/export", async ([FromQuery] string classCode, [FromQuery] string facultyCode,
        [FromQuery] string academicYear, [FromQuery] int semester, TuitionDbContext db, ILogger logger,
        IWritingToFile<ExportStudentTuitionIoRecord> writer) =>
    {
        // Tối ưu truy vấn: sử dụng projection với LEFT JOIN thay vì Include/ThenInclude
        var studentTuitionData = await (from student in db.StudentBasicInfos
                where student.ClassCode == classCode && student.FacultyCode == facultyCode
                join tuition in db.Tuitions on new
                        { student.StudentCode, AcademicYear = academicYear, Semester = semester }
                    equals new { tuition.StudentCode, tuition.AcademicYear, tuition.Semester } into tuitionGroup
                from tuition in tuitionGroup.DefaultIfEmpty()
                select new
                {
                    student.LastName,
                    student.FirstName,
                    TuitionFee = tuition != null ? tuition.TuitionFee : 0,
                    StudentCode = student.StudentCode,
                    // Tính tổng số tiền đã thanh toán ngay trong database
                    StudentFee = tuition != null
                        ? db.TuitionPayments
                            .Where(p => p.StudentCode == student.StudentCode &&
                                        p.AcademicYear == academicYear &&
                                        p.Semester == semester)
                            .Sum(p => (int?)p.AmountPaid) ?? 0
                        : 0
                })
            .OrderBy(s => s.StudentCode)
            .ToListAsync();

        // Chuyển đổi sang DTO với minimal processing
        var studentTuitionIoRecords = studentTuitionData.Select(s => new StudentTuitionIoRecord
        {
            LastName = new LastName(s.LastName),
            FirstName = new FirstName(s.FirstName),
            TuitionFee = new Money(s.TuitionFee),
            StudentFee = new Money(s.StudentFee)
        }).ToList();

        var exportStudentTuitionIoRecord = new ExportStudentTuitionIoRecord
        {
            ClassCode = new ClassCode(classCode),
            FacultyCode = new FacultyCode(facultyCode),
            StudentTuitionIoRecords = studentTuitionIoRecords
        };

        var stream = await writer.WriteToFileAsync(
            new MemoryOptimizedStream(FileMode.Create, FileAccess.ReadWrite, FileShare.Read),
            exportStudentTuitionIoRecord, CancellationToken.None);

        return Results.File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "tuition.xlsx");
    }).WithName("ExportTuition")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .WithDescription("Xuất học phí của sinh viên");