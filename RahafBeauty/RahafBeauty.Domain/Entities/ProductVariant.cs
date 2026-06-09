using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class ProductVariant : AuditableEntity
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid? ProductColorId { get; set; }

    public ProductColor? ProductColor { get; set; }

    public Guid? ProductSizeId { get; set; }

    public ProductSize? ProductSize { get; set; }

    public decimal? Price { get; set; }

    public decimal? OldPrice { get; set; }

    public int Stock { get; set; } = 0;

    public string? SKU { get; set; }

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}