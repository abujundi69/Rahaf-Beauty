using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class ProductReview : AuditableEntity
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public Guid? OrderId { get; set; }

    public Order? Order { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public bool IsApproved { get; set; } = true;
}