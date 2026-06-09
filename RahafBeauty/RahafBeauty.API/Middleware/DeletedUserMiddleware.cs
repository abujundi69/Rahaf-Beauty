using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Infrastructure.Persistence;

namespace RahafBeauty.API.Middleware;

public sealed class DeletedUserMiddleware
{
    private readonly RequestDelegate _next;

    public DeletedUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, RahafBeautyDbContext db)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var value = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.User.FindFirstValue("sub");
            if (!Guid.TryParse(value, out var userId) ||
                !await db.Users.AsNoTracking().AnyAsync(u => u.Id == userId && !u.IsDeleted))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(ApiResponseFactory.Error("unauthorized", "الحساب غير موجود أو تم حذفه"));
                return;
            }
        }

        await _next(context);
    }
}
