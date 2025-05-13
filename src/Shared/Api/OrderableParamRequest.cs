namespace Shared.Api;

public record OrderableParamRequest(string? OrderBy, bool Desc = false, int Page = 0, int Size = 10)
    : PageableParamRequest(Page, Size);