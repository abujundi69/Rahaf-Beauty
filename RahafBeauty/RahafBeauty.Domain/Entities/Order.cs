using RahafBeauty.Domain.Common;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Domain.Entities;

public class Order : AuditableEntity
{
    public string OrderNumber { get; set; } = string.Empty;

    public Guid? UserId { get; set; }

    public User? User { get; set; }

    public bool CustomerDeleted { get; set; } = false;

    public string CustomerNameSnapshot { get; set; } = string.Empty;

    public string? CustomerPhoneSnapshot { get; set; }

    public string? CustomerEmailSnapshot { get; set; }

    public string City { get; set; } = string.Empty;

    public string Area { get; set; } = string.Empty;

    public string Street { get; set; } = string.Empty;

    public string? Building { get; set; }

    public string? Notes { get; set; }

    public decimal Subtotal { get; set; }

    public decimal DiscountTotal { get; set; } = 0;

    public decimal DeliveryFee { get; set; } = 0;

    public decimal Total { get; set; }

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.PendingOnDelivery;

    public OrderStatus Status { get; set; } = OrderStatus.UnderReview;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();

    public ICollection<AdminNotification> AdminNotifications { get; set; } = new List<AdminNotification>();
}