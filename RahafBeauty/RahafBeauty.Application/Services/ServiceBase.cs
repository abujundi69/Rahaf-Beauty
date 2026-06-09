using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Domain.Entities;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.Services;

public abstract class ServiceBase
{
    protected readonly IApplicationDbContext Db;
    protected readonly ICurrentUserService CurrentUser;

    protected ServiceBase(IApplicationDbContext db, ICurrentUserService currentUser)
    {
        Db = db;
        CurrentUser = currentUser;
    }

    protected Guid RequireUserId()
    {
        if (!CurrentUser.IsAuthenticated || CurrentUser.UserId is null)
        {
            throw new UnauthorizedAppException();
        }

        return CurrentUser.UserId.Value;
    }

    protected async Task<User> RequireActiveUserAsync(CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        var user = await Db.Users.FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, cancellationToken);
        return user ?? throw new UnauthorizedAppException("الحساب غير موجود أو تم حذفه");
    }

    protected async Task<User> RequireActiveCustomerAsync(CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveUserAsync(cancellationToken);
        if (user.Role != UserRole.Customer)
        {
            throw new ForbiddenAppException("حساب المدير لا يمكنه تنفيذ عمليات التسوق");
        }

        return user;
    }
}
