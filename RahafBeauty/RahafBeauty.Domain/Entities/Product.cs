using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class Product : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public Guid? BrandId { get; set; }

    public Brand? Brand { get; set; }

    public string? BrandName { get; set; }

    public Guid CategoryId { get; set; }

    public Category Category { get; set; } = null!;

    public decimal BasePrice { get; set; }

    public decimal? BaseOldPrice { get; set; }

    public string? Description { get; set; }

    public string? Ingredients { get; set; }

    public string? HowToUse { get; set; }

    public string? SkinType { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsNew { get; set; } = false;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    public ICollection<ProductVideo> Videos { get; set; } = new List<ProductVideo>();

    public ICollection<ProductColor> Colors { get; set; } = new List<ProductColor>();

    public ICollection<ProductSize> Sizes { get; set; } = new List<ProductSize>();

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();

    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
