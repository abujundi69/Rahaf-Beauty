using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;

namespace RahafBeauty.API.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (AppValidationException ex)
        {
            await WriteErrorAsync(context, 400, ex.Code, ex.Message, ex.Fields);
        }
        catch (AppException ex)
        {
            await WriteErrorAsync(context, ex.StatusCode, ex.Code, ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            await WriteErrorAsync(context, 401, "unauthorized", "يجب تسجيل الدخول أولا");
        }
        catch (KeyNotFoundException ex)
        {
            await WriteErrorAsync(context, 404, "not_found", ArabicOrDefault(ex.Message, "العنصر غير موجود"));
        }
        catch (BadHttpRequestException ex)
        {
            await WriteErrorAsync(context, 400, "bad_request", ArabicOrDefault(ex.Message, "الطلب غير صالح"));
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Database concurrency conflict");
            await WriteErrorAsync(context, 409, "concurrency_error", "تم تعديل البيانات من جلسة أخرى. يرجى تحديث الصفحة والمحاولة مرة أخرى");
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Database update failed");
            await WriteErrorAsync(context, 400, "database_error", "تعذر حفظ البيانات. يرجى التحقق من المدخلات");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteErrorAsync(context, 500, "server_error", "حدث خطأ غير متوقع");
        }
    }

    private static async Task WriteErrorAsync(
        HttpContext context,
        int statusCode,
        string code,
        string message,
        IDictionary<string, string[]>? fields = null)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(ApiResponseFactory.Error(code, message, fields));
    }

    private static string ArabicOrDefault(string? message, string fallback)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return fallback;
        }

        return message.Any(character => character is >= '\u0600' and <= '\u06FF')
            ? message
            : fallback;
    }
}
