using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.Application.Services;

public sealed class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _db;

    public NotificationService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<AdminNotificationDto>> GetAdminNotificationsAsync(NotificationQuery query, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var notifications = _db.AdminNotifications
            .AsNoTracking()
            .Include(n => n.Order)
            .AsQueryable();

        if (query.UnreadOnly)
        {
            notifications = notifications.Where(n => !n.IsRead);
        }

        var total = await notifications.CountAsync(cancellationToken);
        var items = await notifications
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new AdminNotificationDto(
                n.Id,
                n.Type,
                n.Title,
                n.Message,
                n.OrderId,
                n.Order != null ? n.Order.OrderNumber : null,
                n.Order != null ? n.Order.CustomerNameSnapshot : null,
                n.Order != null ? n.Order.Total : null,
                n.Order != null ? n.Order.Status : null,
                n.IsRead,
                n.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminNotificationDto>(items, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task MarkReadAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var notification = await _db.AdminNotifications.FirstOrDefaultAsync(n => n.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("الإشعار غير موجود");

        notification.IsRead = true;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllReadAsync(CancellationToken cancellationToken = default)
    {
        var notifications = await _db.AdminNotifications.Where(n => !n.IsRead).ToListAsync(cancellationToken);
        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
