using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.DTOs;

public sealed record NotificationQuery(bool UnreadOnly = false, int Page = 1, int PageSize = 20);

public sealed record AdminNotificationDto(
    Guid Id,
    NotificationType Type,
    string Title,
    string? Message,
    Guid? OrderId,
    string? OrderNumber,
    string? CustomerName,
    decimal? Total,
    OrderStatus? OrderStatus,
    bool IsRead,
    DateTime CreatedAt);
