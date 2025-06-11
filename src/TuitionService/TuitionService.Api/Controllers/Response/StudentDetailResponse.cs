using TuitionService.Api.Response;

public record StudentDetailResponse : StudentBasicResponse
{
    public IList<TuitionResponse> Tuitions { get; set; } = new List<TuitionResponse>();
}