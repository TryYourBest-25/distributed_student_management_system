using FacultyService.Application.CreditClasses.IoDto;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Shared.FileHelper;

namespace FacultyItService.Infrastructure.CreditClassIo;

public class PdfCreditClassWrite : IWritingToFile<ExportCreditClassIoRecord>
{
    public async Task<Stream> WriteToFileAsync(Stream stream, ExportCreditClassIoRecord data,
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
                            c.Line($"KHOA: {data.FacultyName}").FontSize(16).SemiBold();
                            c.Line($"NIÊN KHÓA: {data.AcademicYearCode} - HỌC KỲ: {data.Semester}").FontSize(16)
                                .SemiBold();
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
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                            });

                            t.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("STT");
                                header.Cell().Element(CellStyle).Text("Tên môn học");
                                header.Cell().Element(CellStyle).Text("Nhóm");
                                header.Cell().Element(CellStyle).Text("Họ tên giảng viên");
                                header.Cell().Element(CellStyle).Text("Số lượng tối thiểu");
                                header.Cell().Element(CellStyle).Text("Số lượng thực tế");
                            });

                            for (var i = 0; i < data.CreditClasses.Count; i++)
                            {
                                var creditClass = data.CreditClasses[i];
                                t.Cell().Element(CellStyle).Text((i + 1).ToString());
                                t.Cell().Element(CellStyle).Text(creditClass.CourseName);
                                t.Cell().Element(CellStyle).Text(creditClass.GroupNumber);
                                t.Cell().Element(CellStyle)
                                    .Text($"{creditClass.LastNameLecturer} {creditClass.FirstNameLecturer}");
                                t.Cell().Element(CellStyle).Text(creditClass.MinStudent.ToString());
                                t.Cell().Element(CellStyle).Text(creditClass.TotalStudent.ToString());
                            }
                        });

                        page.Footer().AlignLeft().Text($"Số lớp đã mở: {data.CreditClasses.Count}").FontSize(12);
                    });
                })
                .GeneratePdf(stream);
        }), cancellationToken);

        return stream;
    }
}