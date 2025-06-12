using Shared.Domain.ValueObject;

namespace TuitionService.Domain.ValueObject;

public record class TuitionPaymentId
{
    public StudentCode StudentCode { get; init; }
    public AcademicYearCode AcademicYear { get; init; }
    public Semester Semester { get; init; }

    public DateOnly PaymentDate { get; init; }

    public TuitionPaymentId(StudentCode studentCode, AcademicYearCode academicYear, Semester semester,
        DateOnly paymentDate)
    {
        StudentCode = studentCode;
        AcademicYear = academicYear;
        Semester = semester;
        PaymentDate = paymentDate;
    }
}