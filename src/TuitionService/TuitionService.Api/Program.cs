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
using TuitionService.Api.Controllers.Response;
using TuitionService.Application.IoDto;
using TuitionService.Domain;
using TuitionService.Domain.Aggregate;
using TuitionService.Domain.Entity;
using TuitionService.Domain.ValueObject;
using TuitionService.Infrastructure.TuitionIo;
using TuitionService.Api.JsonConverters;
using ILogger = Microsoft.Extensions.Logging.ILogger;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory())
    .ConfigureContainer<ContainerBuilder>(containerBuilder =>
    {
        containerBuilder.RegisterType<PdfStudentTuitionWriter>().As<IWritingToFile<ExportStudentTuitionIoRecord>>()
            .SingleInstance();
    }).UseSerilog((context, provider, configuration) =>
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
        // Add custom DateOnly converter to handle YYYY-MM-DD format correctly
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
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

app.UseCors();

if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Docker"))
{
    app.UseHttpsRedirection();
}

app.UseExceptionHandler();


app.MapControllers();

var group = app.MapGroup("/api/v{version:apiVersion}")
    .WithApiVersionSet(versionSet);


group.MapGet("/students/{studentCode}",
        async ([FromRoute] string studentCode, TuitionDbContext db, ILogger<Program> logger) =>
        {
            var student = await db.StudentBasicInfos.Where(s => s.StudentCode == studentCode).Select(s =>
                              new StudentDetailResponse
                              {
                                  StudentCode = s.StudentCode,
                                  LastName = s.LastName,
                                  FirstName = s.FirstName,
                                  ClassCode = s.ClassCode,
                                  FacultyCode = s.FacultyCode,
                                  Tuitions = s.Tuitions.Select(t => new TuitionResponse
                                  {
                                      AcademicYear = t.AcademicYear,
                                      Semester = t.Semester.ToString(),
                                      TuitionAmount = t.TuitionFee,
                                      TuitionPaid = t.TuitionPayments.Sum(p => p.AmountPaid)
                                  }).ToList()
                              }).FirstOrDefaultAsync() ??
                          throw new ResourceNotFoundException($"Sinh viên không tồn tại: {studentCode}");
            return Results.Ok(student);
        }).WithName("GetStudent")
    .WithTags("Students")
    .Produces<StudentDetailResponse>(StatusCodes.Status200OK)
    .WithDescription("Lấy thông tin sinh viên");


group.MapPost("/students/{studentCode}/tuitions",
        async ([FromRoute] string studentCode, RequiredTuitionStudentRequest request, TuitionDbContext db,
            ILogger<Program> logger) =>
        {
            var newTuition = new Tuition
            {
                StudentCode = new StudentCode(studentCode).Value,
                AcademicYear = ((AcademicYearCode)request.AcademicYear).Value,
                Semester = new Semester(request.Semester).Value,
                TuitionFee = new Money(request.TuitionFee).Value
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
        async ([AsParameters] GridifyQuery filter, TuitionDbContext db,
            ILogger<Program> logger) =>
        {
            var query = await db.StudentBasicInfos.AsNoTracking().Select(s => new StudentBasicInfo
            {
                StudentCode = s.StudentCode,
                LastName = s.LastName,
                FirstName = s.FirstName,
                ClassCode = s.ClassCode,
                FacultyCode = s.FacultyCode
            }).ToPagedListAsync(filter.Page, filter.PageSize);

            return Results.Ok(query);
        }).WithName("GetStudents")
    .WithTags("Students")
    .Produces<Paging<StudentBasicInfo>>(StatusCodes.Status200OK)
    .WithDescription("Tìm kiếm sinh viên");

group.MapGet("/students/search",
        async ([AsParameters] GridifyQuery filter, TuitionDbContext db,
            ILogger<Program> logger) =>
        {
            var query = await db.StudentBasicInfos.AsNoTracking().Select(s => new StudentBasicInfo
            {
                StudentCode = s.StudentCode,
                LastName = s.LastName,
                FirstName = s.FirstName,
                ClassCode = s.ClassCode,
                FacultyCode = s.FacultyCode
            }).ApplyFiltering(filter).ToPagedListAsync(filter.Page, filter.PageSize);

            return Results.Ok(query);
        }).WithName("SearchStudent")
    .WithTags("Students")
    .Produces<Paging<StudentBasicInfo>>(StatusCodes.Status200OK)
    .WithDescription("Tìm kiếm sinh viên");


group.MapGet("/students/{studentCode}/tuitions",
        async ([FromRoute] string studentCode, TuitionDbContext db, ILogger<Program> logger) =>
        {
            var tuition = await db.Tuitions.Where(t => t.StudentCode == studentCode).Select(t => new TuitionResponse
            {
                AcademicYear = t.AcademicYear,
                Semester = t.Semester.ToString(),
                TuitionAmount = t.TuitionFee,
                TuitionPaid = t.TuitionPayments.Sum(p => p.AmountPaid)
            }).ToListAsync();

            return Results.Ok(tuition);
        }).WithName("GetTuition")
    .WithTags("Tuition")
    .Produces<Tuition>(StatusCodes.Status200OK)
    .WithDescription("Lấy học phí của sinh viên");

group.MapGet("/students/{studentCode}/tuitions/{academicYear}/{semester}/payments",
        async ([FromRoute] string studentCode, [FromRoute] string academicYear, [FromRoute] int semester,
            TuitionDbContext db, ILogger<Program> logger) =>
        {
            var payments = await db.TuitionPayments
                .Where(p => p.StudentCode == studentCode && p.AcademicYear == academicYear && p.Semester == semester)
                .Select(p => new PaymentResponse
                {
                    PaymentDate = p.PaymentDate.ToString("dd/MM/yyyy"),
                    AmountPaid = p.AmountPaid
                }).ToListAsync();
            return Results.Ok(payments);
        }).WithName("GetTuitionPayments")
    .WithTags("Tuition")
    .Produces<PaymentResponse>(StatusCodes.Status200OK)
    .WithDescription("Lấy danh sách thanh toán học phí của sinh viên");

group.MapDelete("/students/{studentCode}/tuitions",
        async ([FromRoute] string studentCode, [FromBody] List<DeleteStudentTuitionRequest> request,
            TuitionDbContext db, ILogger<Program> logger) =>
        {
            var academicYears = request.Select(r => ((AcademicYearCode)r.AcademicYear).Value).ToList();
            var semesters = request.Select(r => new Semester(r.Semester).Value).ToList();
            var tuitions = await db.Tuitions.Where(t => t.StudentCode == studentCode &&
                                                        academicYears.Contains(t.AcademicYear) &&
                                                        semesters.Contains(t.Semester)).ExecuteDeleteAsync();

            return Results.Ok(tuitions);
        }).WithName("DeleteTuition")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .Accepts<List<DeleteStudentTuitionRequest>>("application/json")
    .WithDescription("Xóa học phí của sinh viên");

group.MapGet("/students/{studentCode}/tuitions/search", async ([FromRoute] string studentCode,
        [AsParameters] GridifyQuery filter, TuitionDbContext db,
        ILogger<Program> logger) =>
    {
        var query = await db.Tuitions.Where(t => t.StudentCode == studentCode).AsNoTracking()
            .ApplyFiltering(filter)
            .Select(t => new TuitionResponse
            {
                AcademicYear = t.AcademicYear,
                Semester = t.Semester.ToString(),
                TuitionAmount = t.TuitionFee,
                TuitionPaid = t.TuitionPayments.Sum(p => p.AmountPaid)
            }).ToListAsync();

        return Results.Ok(new Paging<TuitionResponse>
        {
            Data = query,
            Count = query.Count()
        });
    }).WithName("SearchTuition")
    .WithTags("Tuition")
    .Produces<Paging<Tuition>>(StatusCodes.Status200OK)
    .WithDescription("Tìm kiếm học phí của sinh viên");


group.MapPut("/students/{studentCode}/tuitions/{academicYear}/{semester}/payments", async (
        [FromRoute] string studentCode, [FromRoute] string academicYear, [FromRoute] int semester,
        [FromBody] CreateOrUpdatePaymentRequest request, TuitionDbContext db, ILogger<Program> logger) =>
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

        try
        {
            var money = new Money(request.Money);
            var paymentDate = DateOnly.TryParseExact(request.PaymentDate, "dd/MM/yyyy", out var parsedDate)
                ? parsedDate
                : throw new BadInputException("Ngày thanh toán không hợp lệ, vui lòng sử dụng định dạng dd/MM/yyyy");
            var semesterRequest = new Semester(semester).Value;
            var academicYearRequest = new AcademicYearCode(academicYear).Value;

            // Reload entity để tránh concurrency issues
            var tuition = await db.Tuitions
                              .Include(t => t.TuitionPayments)
                              .Where(t => t.StudentCode == studentCode &&
                                          t.AcademicYear == academicYearRequest &&
                                          t.Semester == semesterRequest)
                              .FirstOrDefaultAsync() ??
                          throw new ResourceNotFoundException(
                              $"Không tìm thấy học phí: {studentCode} {academicYear} {semester}");

            var existingPayment = await db.TuitionPayments
                .Where(p => p.StudentCode == studentCode &&
                            p.AcademicYear == academicYear &&
                            p.Semester == semesterRequest &&
                            p.PaymentDate == paymentDate)
                .FirstOrDefaultAsync();

            if (existingPayment is null)
            {
                // Kiểm tra tổng số tiền thanh toán
                var totalPaid = await db.TuitionPayments
                    .Where(p => p.StudentCode == studentCode &&
                                p.AcademicYear == academicYear &&
                                p.Semester == semesterRequest)
                    .SumAsync(p => p.AmountPaid);

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

                await db.TuitionPayments.AddAsync(newPayment);
            }
            else
            {
                // Cập nhật trực tiếp trong database để tránh tracking issues
                await db.TuitionPayments
                    .Where(p => p.StudentCode == studentCode &&
                                p.AcademicYear == academicYear &&
                                p.Semester == semesterRequest &&
                                p.PaymentDate == paymentDate)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(p => p.AmountPaid, money.Value));
            }

            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Results.Ok();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }).WithName("CreateOrUpdateTuitionPayment")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .WithDescription("Thanh toán học phí của sinh viên");

group.MapPost("/students/{studentCode}/tuitions/{academicYear}/{semester}/payments", async (
        [FromRoute] string studentCode, [FromRoute] string academicYear, [FromRoute] int semester,
        [FromBody] CreateOrUpdatePaymentRequest request, TuitionDbContext db, ILogger<Program> logger) =>
    {
        var money = new Money(request.Money);
        var paymentDate = DateOnly.TryParseExact(request.PaymentDate, "dd/MM/yyyy", out var parsedDate)
            ? parsedDate
            : throw new BadInputException("Ngày thanh toán không hợp lệ, vui lòng sử dụng định dạng dd/MM/yyyy");
        var semesterRequest = new Semester(semester);
        var academicYearRequest = new AcademicYearCode(academicYear);

        var payment = new TuitionPayment
        {
            StudentCode = new StudentCode(studentCode).Value,
            AcademicYear = academicYearRequest.Value,
            Semester = semesterRequest.Value,
            PaymentDate = paymentDate,
            AmountPaid = money.Value
        };

        await db.TuitionPayments.AddAsync(payment);

        await db.SaveChangesAsync();

        return Results.Ok();
    }).WithName("CreateTuitionPayment")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .Accepts<CreateOrUpdatePaymentRequest>("application/json")
    .WithDescription("Thanh toán học phí của sinh viên");

group.MapDelete("/students/{studentCode}/tuitions/{academicYear}/{semester}/payments",
        async ([FromRoute] string studentCode, [FromBody] List<DeleteTuitionPaymentRequest> request,
            TuitionDbContext db, ILogger<Program> logger) =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
            var academicYears = request.Select(r => ((AcademicYearCode)r.AcademicYear).Value).ToList();
            var semesters = request.Select(r => new Semester(r.Semester).Value).ToList();
            var paymentDates = request.Select(r =>
                DateOnly.TryParseExact(r.PaymentDate, "dd/MM/yyyy", out var parsedDate)
                    ? parsedDate
                    : throw new BadInputException(
                        "Ngày thanh toán không hợp lệ, vui lòng sử dụng định dạng dd/MM/yyyy")).ToList();
            var payments = await db.TuitionPayments.Where(p => p.StudentCode == studentCode &&
                                                               academicYears.Contains(p.AcademicYear) &&
                                                               semesters.Contains(p.Semester) &&
                                                               paymentDates.Contains(p.PaymentDate))
                .ExecuteDeleteAsync();

            await transaction.CommitAsync();

            return Results.Ok(payments);
        }).WithName("DeleteTuitionPayment")
    .WithTags("Tuition")
    .Produces(StatusCodes.Status200OK)
    .Accepts<List<DeleteTuitionPaymentRequest>>("application/json")
    .WithDescription("Xóa học phí của sinh viên");

group.MapGet("/tuitions/export", async ([FromQuery] string classCode, [FromQuery] string facultyCode,
        [FromQuery] string academicYear, [FromQuery] int semester, TuitionDbContext db, ILogger<Program> logger,
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

app.Run();