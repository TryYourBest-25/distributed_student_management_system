using System;
using FacultyService.Application.Students.Response;

namespace FacultyService.Application.CreditClasses.Response;

public record CreditClassDetailResponse : CreditClassBasicResponse
{
    public string LecturerName { get; set; } = null!;
    public string LecturerCode { get; set; } = null!;

    public string CourseName { get; set; } = null!;

    public int LectureCredit { get; set; }

    public int LabCredit { get; set; }

    public IList<StudentBasicResponse> Students { get; set; } = [];
}