namespace Shared.Api;

public record PageableParamRequest(int Page = 0, int Size = 10);