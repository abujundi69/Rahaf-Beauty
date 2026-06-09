using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class Wishlist : CreationEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
}