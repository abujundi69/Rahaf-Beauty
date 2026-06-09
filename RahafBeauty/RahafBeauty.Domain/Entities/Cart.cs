using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class Cart : AuditableEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}