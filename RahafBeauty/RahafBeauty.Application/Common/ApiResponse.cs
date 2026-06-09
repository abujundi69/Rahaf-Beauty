namespace RahafBeauty.Application.Common;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public ApiError? Error { get; init; }
}

public sealed class ApiResponse
{
    public bool Success { get; init; }
    public object? Data { get; init; }
    public string? Message { get; init; }
    public ApiError? Error { get; init; }
}

public sealed class ApiError
{
    public string Code { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public IDictionary<string, string[]> Fields { get; init; } = new Dictionary<string, string[]>();
}

public static class ApiResponseFactory
{
    public static ApiResponse<T> Success<T>(T data, string? message = null) =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse Success(string? message = null, object? data = null) =>
        new() { Success = true, Data = data ?? new { }, Message = message };

    public static ApiResponse Error(string code, string message, IDictionary<string, string[]>? fields = null) =>
        new()
        {
            Success = false,
            Error = new ApiError
            {
                Code = code,
                Message = message,
                Fields = fields ?? new Dictionary<string, string[]>()
            }
        };
}
