namespace RahafBeauty.Application.Common;

public class AppException : Exception
{
    public AppException(string code, string message, int statusCode = 400)
        : base(message)
    {
        Code = code;
        StatusCode = statusCode;
    }

    public string Code { get; }

    public int StatusCode { get; }
}

public sealed class AppValidationException : AppException
{
    public AppValidationException(string message, IDictionary<string, string[]> fields)
        : base("validation_error", message, 400)
    {
        Fields = fields;
    }

    public IDictionary<string, string[]> Fields { get; }
}

public sealed class ForbiddenAppException : AppException
{
    public ForbiddenAppException(string message = "غير مصرح بتنفيذ هذه العملية")
        : base("forbidden", message, 403)
    {
    }
}

public sealed class UnauthorizedAppException : AppException
{
    public UnauthorizedAppException(string message = "يجب تسجيل الدخول أولا")
        : base("unauthorized", message, 401)
    {
    }
}
