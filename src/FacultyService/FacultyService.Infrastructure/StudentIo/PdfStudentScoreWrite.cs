using FacultyService.Application.Students.IoDto;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Shared.FileHelper;

namespace FacultyItService.Infrastructure.StudentIo;

public class PdfStudentScoreWrite : IWritingToFile<ExportStudentScoreIoRecord>
{
    public async Task<Stream> WriteToFileAsync(Stream stream, ExportStudentScoreIoRecord data,
        CancellationToken cancellationToken)
    {
        await Task.Run((() =>
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
                        c.Line("BẢNG ĐIỂM SINH VIÊN").FontSize(20).SemiBold();
                        c.Line($"KHOA: {data.FacultyName}").FontSize(16).SemiBold();
                        c.Line($"NIÊN KHÓA: {data.AcademicYearCode} - LỚP: {data.ClassCode}").FontSize(16).SemiBold();
                        c.Line($"MÃ SINH VIÊN: {data.StudentCode}").FontSize(16).SemiBold();
                        c.Line($"HỌ TÊN: {data.LastName} {data.FirstName}").FontSize(16).SemiBold();
                        c.AlignLeft();
                    });

                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("STT");
                            header.Cell().Text("Môn học");
                            header.Cell().Text("Điểm thi");
                        });

                        for (var i = 0; i < data.ExportStudentScoreInCourseIoRecords.Count; i++)
                        {
                            var studentScore = data.ExportStudentScoreInCourseIoRecords[i];
                            table.Cell().Text(studentScore.CourseName);
                            table.Cell().Text(studentScore.FinalScore.ToString());
                        }
                    });
                });
            });
        }), cancellationToken);

        return stream;
    }
}