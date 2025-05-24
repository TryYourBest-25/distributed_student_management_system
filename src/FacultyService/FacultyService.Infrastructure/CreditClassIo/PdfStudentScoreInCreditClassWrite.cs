using FacultyService.Application.CreditClasses.IoDto;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Shared.FileHelper;

namespace FacultyItService.Infrastructure.CreditClassIo;

public class PdfStudentScoreInCreditClassWrite : IWritingToFile<ExportStudentScoreInCreditClassIoRecord>
{
    public async Task<Stream> WriteToFileAsync(Stream stream, ExportStudentScoreInCreditClassIoRecord data,
        CancellationToken cancellationToken)
    {
        await Task.Run(() =>
        {
            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);

                    page.Margin(2, Unit.Centimetre);

                    page.DefaultTextStyle(style =>
                    {
                        style.FontSize(12);
                        style.FontFamily("Arial");
                        return style;
                    });

                    page.Header().Text(c =>
                    {
                        c.Line($"BẢNG ĐIỂM HẾT MÔN")
                            .FontSize(20)
                            .SemiBold();
                        c.Line($"KHOA: {data.FacultyName}").FontSize(16).SemiBold();
                        c.Line($"NIÊN KHÓA: {data.AcademicYearCode} - HỌC KỲ: {data.Semester}").FontSize(16)
                            .SemiBold();
                        c.Line($"MÔN HỌC: {data.CourseName} - NHÓM: {data.GroupNumber}").FontSize(16).SemiBold();
                        c.AlignCenter();
                    });

                    page.Content().Table(t =>
                    {
                        static IContainer CellStyle(IContainer container)
                        {
                            return container
                                .Padding(5)
                                .BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                        }

                        t.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                        });

                        t.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("STT");
                            header.Cell().Element(CellStyle).Text("MSSV");
                            header.Cell().Element(CellStyle).Text("HỌ");
                            header.Cell().Element(CellStyle).Text("TÊN");
                            header.Cell().Element(CellStyle).Text("CHUYÊN CẦN");
                            header.Cell().Element(CellStyle).Text("GIỮA KỲ");
                            header.Cell().Element(CellStyle).Text("CUỐI KỲ");
                            header.Cell().Element(CellStyle).Text("TỔNG KẾT");
                        });

                        for (var i = 0; i < data.Students.Count; i++)
                        {
                            var student = data.Students[i];
                            t.Cell().Element(CellStyle).Text((i + 1).ToString());
                            t.Cell().Element(CellStyle).Text(student.StudentCode.ToString());
                            t.Cell().Element(CellStyle).Text(student.LastName.ToString());
                            t.Cell().Element(CellStyle).Text(student.FirstName.ToString());
                            t.Cell().Element(CellStyle).Text(student.Scores.AttendanceScore.ToString());
                            t.Cell().Element(CellStyle).Text(student.Scores.MidtermScore.ToString());
                            t.Cell().Element(CellStyle).Text(student.Scores.FinalScore.ToString());
                            t.Cell().Element(CellStyle).Text(student.Scores.AvgScore.ToString());
                        }
                    });

                    page.Footer().Text($"Số sinh viên: {data.Students.Count}")
                        .FontSize(16)
                        .SemiBold();
                });
            }).GeneratePdf(stream);
        }, cancellationToken);

        return stream;
    }
}