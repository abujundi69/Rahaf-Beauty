using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Application.Services;

public sealed class CartService : ServiceBase, ICartService
{
    private readonly IDiscountResolver _discountResolver;
    private readonly IPriceResolver _priceResolver;

    public CartService(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IDiscountResolver discountResolver,
        IPriceResolver priceResolver)
        : base(db, currentUser)
    {
        _discountResolver = discountResolver;
        _priceResolver = priceResolver;
    }

    public async Task<CartDto> GetCartAsync(CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        return MapCart(cart);
    }

    public async Task<CartDto> AddItemAsync(AddCartItemRequest request, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Positive(fields, nameof(request.Quantity), request.Quantity);
        ValidationHelper.ThrowIfInvalid(fields);

        var product = await LoadProductForShoppingAsync(request.ProductId, cancellationToken);
        var selection = ValidateSelection(product, request.ProductSizeId, request.ProductColorId, request.ProductVariantId);
        var cart = await GetOrCreateCartAsync(user.Id, cancellationToken);

        var discount = await _discountResolver.ResolveAsync(product.Id, product.BrandId, DateTime.UtcNow, cancellationToken);
        var unitPrice = _priceResolver.ResolveUnitPrice(new ProductPriceContext(product.BasePrice, selection.Size?.Price, selection.Variant?.Price));
        var finalUnitPrice = ApplyDiscount(unitPrice, discount.Percentage);

        var existing = cart.Items.FirstOrDefault(i =>
            i.ProductId == request.ProductId &&
            i.ProductSizeId == selection.Size?.Id &&
            i.ProductColorId == selection.Color?.Id &&
            (selection.Variant is null
                ? !i.ProductVariantId.HasValue
                : i.ProductVariantId == selection.Variant.Id || !i.ProductVariantId.HasValue));

        if (existing is not null)
        {
            var requestedQuantity = existing.Quantity + request.Quantity;
            existing.Quantity = requestedQuantity;
            existing.ProductSizeId = selection.Size?.Id;
            existing.ProductColorId = selection.Color?.Id;
            existing.ProductVariantId = selection.Variant?.Id;
            existing.UnitPrice = unitPrice;
            existing.DiscountPercent = discount.Percentage;
            existing.FinalUnitPrice = finalUnitPrice;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            Db.CartItems.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                ProductSizeId = selection.Size?.Id,
                ProductColorId = selection.Color?.Id,
                ProductVariantId = selection.Variant?.Id,
                Quantity = request.Quantity,
                UnitPrice = unitPrice,
                DiscountPercent = discount.Percentage,
                FinalUnitPrice = finalUnitPrice
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await Db.SaveChangesAsync(cancellationToken);
        cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        return MapCart(cart);
    }

    public async Task<CartDto> UpdateItemAsync(Guid id, UpdateCartItemRequest request, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Positive(fields, nameof(request.Quantity), request.Quantity);
        ValidationHelper.ThrowIfInvalid(fields);

        var cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == id)
            ?? throw new KeyNotFoundException("عنصر السلة غير موجود");

        var product = await LoadProductForShoppingAsync(item.ProductId, cancellationToken);
        var selection = ValidateSelection(product, item.ProductSizeId, item.ProductColorId, item.ProductVariantId);
        var discount = await _discountResolver.ResolveAsync(product.Id, product.BrandId, DateTime.UtcNow, cancellationToken);
        var unitPrice = _priceResolver.ResolveUnitPrice(new ProductPriceContext(product.BasePrice, selection.Size?.Price, selection.Variant?.Price));

        item.Quantity = request.Quantity;
        item.UnitPrice = unitPrice;
        item.DiscountPercent = discount.Percentage;
        item.FinalUnitPrice = ApplyDiscount(unitPrice, discount.Percentage);
        item.UpdatedAt = DateTime.UtcNow;
        cart.UpdatedAt = DateTime.UtcNow;

        await Db.SaveChangesAsync(cancellationToken);
        cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        return MapCart(cart);
    }

    public async Task DeleteItemAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        var item = cart.Items.FirstOrDefault(i => i.Id == id)
            ?? throw new KeyNotFoundException("عنصر السلة غير موجود");

        Db.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await Db.SaveChangesAsync(cancellationToken);
    }

    public async Task ClearAsync(CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        Db.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await Db.SaveChangesAsync(cancellationToken);
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid userId, CancellationToken cancellationToken)
    {
        var cart = await Db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Include(c => c.Items).ThenInclude(i => i.ProductSize)
            .Include(c => c.Items).ThenInclude(i => i.ProductColor)
            .Include(c => c.Items).ThenInclude(i => i.ProductVariant)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (cart is not null)
        {
            return cart;
        }

        cart = new Cart { UserId = userId };
        Db.Carts.Add(cart);
        await Db.SaveChangesAsync(cancellationToken);
        return cart;
    }

    private async Task<Product> LoadProductForShoppingAsync(Guid productId, CancellationToken cancellationToken)
    {
        return await Db.Products
            .Include(p => p.Brand)
            .Include(p => p.Images)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == productId && p.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException("المنتج غير موجود أو غير متاح");
    }

    private static ProductSelection ValidateSelection(Product product, Guid? sizeId, Guid? colorId, Guid? variantId)
    {
        if (product.Sizes.Count > 0 && !sizeId.HasValue)
        {
            throw new AppValidationException("يجب اختيار الحجم", new Dictionary<string, string[]>
            {
                [nameof(sizeId)] = ["يجب اختيار الحجم"]
            });
        }

        if (product.Colors.Count > 0 && !colorId.HasValue)
        {
            throw new AppValidationException("يجب اختيار اللون", new Dictionary<string, string[]>
            {
                [nameof(colorId)] = ["يجب اختيار اللون"]
            });
        }

        var size = sizeId.HasValue
            ? product.Sizes.FirstOrDefault(s => s.Id == sizeId.Value) ?? throw new KeyNotFoundException("الحجم المحدد غير موجود")
            : null;

        var color = colorId.HasValue
            ? product.Colors.FirstOrDefault(c => c.Id == colorId.Value) ?? throw new KeyNotFoundException("اللون المحدد غير موجود")
            : null;

        var variant = ResolveVariant(product, size?.Id, color?.Id, variantId);

        if (variant is not null)
        {
            if (variant.ProductSizeId.HasValue && size?.Id != variant.ProductSizeId.Value)
            {
                throw new AppValidationException("الخيار لا يطابق الحجم المحدد", new Dictionary<string, string[]>
                {
                    [nameof(variantId)] = ["الخيار لا يطابق الحجم المحدد"]
                });
            }

            if (variant.ProductColorId.HasValue && color?.Id != variant.ProductColorId.Value)
            {
                throw new AppValidationException("الخيار لا يطابق اللون المحدد", new Dictionary<string, string[]>
                {
                    [nameof(variantId)] = ["الخيار لا يطابق اللون المحدد"]
                });
            }
        }

        return new ProductSelection(size, color, variant);
    }

    private static ProductVariant? ResolveVariant(Product product, Guid? sizeId, Guid? colorId, Guid? variantId)
    {
        if (product.Variants.Count == 0)
        {
            return null;
        }

        var variant = variantId.HasValue
            ? product.Variants.FirstOrDefault(v => v.Id == variantId.Value) ?? throw new KeyNotFoundException("الخيار المحدد غير موجود")
            : product.Variants.FirstOrDefault(v =>
                v.ProductSizeId == sizeId &&
                v.ProductColorId == colorId);

        if (variant is null)
        {
            throw new AppValidationException("الخيار المحدد غير متوفر", new Dictionary<string, string[]>
            {
                ["variant"] = ["الخيار المحدد غير متوفر"]
            });
        }

        return variant;
    }

    private static CartDto MapCart(Cart cart)
    {
        var items = cart.Items
            .OrderBy(i => i.CreatedAt)
            .Select(i =>
            {
                var lineTotal = i.FinalUnitPrice * i.Quantity;
                return new CartItemDto(
                    i.Id,
                    i.ProductId,
                    i.Product.Name,
                    i.Product.Images.OrderBy(img => img.SortOrder).FirstOrDefault()?.ImageUrl,
                    i.ProductSizeId,
                    i.ProductSize?.Label,
                    i.ProductColorId,
                    i.ProductColor?.Name,
                    i.ProductColor?.HexCode,
                    i.ProductVariantId,
                    i.Quantity,
                    i.UnitPrice,
                    i.DiscountPercent,
                    i.FinalUnitPrice,
                    lineTotal);
            })
            .ToList();

        var subtotal = items.Sum(i => i.UnitPrice * i.Quantity);
        var total = items.Sum(i => i.LineTotal);
        return new CartDto(cart.Id, items, subtotal, subtotal - total, total);
    }

    private static decimal ApplyDiscount(decimal price, decimal? percentage) =>
        percentage.HasValue ? Math.Round(price - (price * percentage.Value / 100m), 2) : price;

    private sealed record ProductSelection(ProductSize? Size, ProductColor? Color, ProductVariant? Variant);
}
