using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Shared.FileHelper;
using TuitionService.Application.IoDto;

namespace TuitionService.Infrastructure.TuitionIo;

public class PdfStudentTuitionWriter : IWritingToFile<ExportStudentTuitionIoRecord>
{
    public async Task<Stream> WriteToFileAsync(Stream stream, ExportStudentTuitionIoRecord data,
        CancellationToken cancellationToken)
    {
        await Task.Run(() => Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(20);

                page.Header().Text(text =>
                {
                    text.Line("DANH SÁCH SINH VIÊN ĐÓNG HỌC PHÍ").FontSize(16).Bold();
                    text.Line($"MÃ LỚP: {data.ClassCode}").FontSize(14);
                    text.AlignCenter();
                });

                page.Content().Table(table =>
                {
                    static IContainer CellStyle(IContainer container)
                    {
                        return container
                            .Padding(5)
                            .BorderBottom(1).BorderColor(Colors.Grey.Lighten2);
                    }

                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Element(CellStyle).Text("STT");
                        header.Cell().Element(CellStyle).Text("Họ và tên");
                        header.Cell().Element(CellStyle).Text("Học phí");
                        header.Cell().Element(CellStyle).Text("Số tiền đã đóng");
                    });

                    for (var i = 0; i < data.StudentTuitionIoRecords.Count; i++)
                    {
                        var studentTuitionIoRecord = data.StudentTuitionIoRecords[i];
                        table.Cell().Element(CellStyle).Text((i + 1).ToString());
                        table.Cell().Element(CellStyle)
                            .Text($"{studentTuitionIoRecord.LastName} {studentTuitionIoRecord.FirstName}");
                        table.Cell().Element(CellStyle).Text(studentTuitionIoRecord.TuitionFee.ToString());
                        table.Cell().Element(CellStyle).Text(studentTuitionIoRecord.StudentFee.ToString());
                    }
                });

                page.Footer().AlignLeft().Text($"Số lượng sinh viên: {data.StudentTuitionIoRecords.Count}")
                    .FontSize(12);
            });
        }).GeneratePdf(stream), cancellationToken);

        return stream;
    }
}