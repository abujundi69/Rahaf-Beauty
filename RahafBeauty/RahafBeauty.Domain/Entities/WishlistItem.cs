using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class WishlistItem : CreationEntity
{
    public Guid WishlistId { get; set; }

    public Wishlist Wishlist { get; set; } = null!;

    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;
}