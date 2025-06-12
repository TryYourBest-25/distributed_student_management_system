using System.Collections.Immutable;
using FacultyService.Application.CreditClasses.IoDto;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Shared.Domain.ValueObject;
using Shared.FileHelper;

namespace FacultyItService.Infrastructure.CreditClassIo;

public class PdfStudentInCreditClassWrite : IWritingToFile<ExportStudentInCreditClassIoRecord>
{
    public async Task<Stream> WriteToFileAsync(Stream stream, ExportStudentInCreditClassIoRecord data,
        CancellationToken cancellationToken)
    {
        /// copy to stream parameter

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
                        c.Line("DANH SÁCH SINH VIÊN ĐĂNG KÝ LỚP TÍN CHỈ").FontSize(20).SemiBold();
                        c.Line($"KHOA: {data.FacultyName}").FontSize(16).SemiBold();
                        c.Line($"NIÊN KHÓA: {data.AcademicYearCode} - HỌC KỲ: {data.Semester}").FontSize(16).SemiBold();
                        c.Line($"MÔN HỌC: {data.CourseName} - NHÓM: {data.GroupNumber}").FontSize(16).SemiBold();
                        c.AlignCenter();
                    });


                    page.Content().PaddingVertical(10).Table(table =>
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
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("STT");
                            header.Cell().Element(CellStyle).Text("MSSV");
                            header.Cell().Element(CellStyle).Text("HỌ");
                            header.Cell().Element(CellStyle).Text("TÊN");
                            header.Cell().Element(CellStyle).Text("PHÁI");
                            header.Cell().Element(CellStyle).Text("LỚP");
                        });

                        for (var i = 0; i < data.Students.Count; i++)
                        {
                            var student = data.Students[i];
                            table.Cell().Element(CellStyle).Text((i + 1).ToString());
                            table.Cell().Element(CellStyle).Text(student.StudentCode.ToString());
                            table.Cell().Element(CellStyle).Text(student.LastName.ToString());
                            table.Cell().Element(CellStyle).Text(student.FirstName.ToString());
                            table.Cell().Element(CellStyle).Text(student.Gender.ToString());
                            table.Cell().Element(CellStyle).Text(student.ClassCode.ToString());
                        }
                    });

                    page.Footer().AlignLeft()
                        .Text($"Số sinh viên đăng ký: {data.TotalStudent}")
                        .FontSize(16)
                        .SemiBold();
                });
            });
        }, cancellationToken);
        return stream;
    }
}