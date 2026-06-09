using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class ProductSize : AuditableEntity
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public string Label { get; set; } = string.Empty;

    public decimal? Price { get; set; }

    public decimal? OldPrice { get; set; }

    public int? Stock { get; set; }

    public string? SKU { get; set; }

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}