public record TuitionResponse
{
    public string AcademicYear { get; set; }
    public string Semester { get; set; }
    public decimal TuitionAmount { get; set; }
    public decimal TuitionPaid { get; set; }
}