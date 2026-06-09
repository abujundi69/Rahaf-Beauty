using RahafBeauty.Domain.Common;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Domain.Entities;

public class OrderStatusHistory : Entity
{
    public Guid OrderId { get; set; }

    public Order Order { get; set; } = null!;

    public OrderStatus Status { get; set; }

    public Guid? ChangedByUserId { get; set; }

    public User? ChangedByUser { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    public string? Note { get; set; }
}