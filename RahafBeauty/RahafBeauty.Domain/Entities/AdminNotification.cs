using RahafBeauty.Domain.Common;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Domain.Entities;

public class AdminNotification : CreationEntity
{
    public NotificationType Type { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Message { get; set; }

    public Guid? OrderId { get; set; }

    public Order? Order { get; set; }

    public bool IsRead { get; set; } = false;
}