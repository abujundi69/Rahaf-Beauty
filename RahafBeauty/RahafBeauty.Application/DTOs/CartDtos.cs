namespace RahafBeauty.Application.DTOs;

public sealed record AddCartItemRequest(
    Guid ProductId,
    Guid? ProductSizeId,
    Guid? ProductColorId,
    Guid? ProductVariantId,
    int Quantity);

public sealed record UpdateCartItemRequest(int Quantity);

public sealed record CartDto(
    Guid Id,
    IReadOnlyList<CartItemDto> Items,
    decimal Subtotal,
    decimal DiscountTotal,
    decimal Total);

public sealed record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ImageUrl,
    Guid? ProductSizeId,
    string? SizeLabel,
    Guid? ProductColorId,
    string? ColorName,
    string? ColorHex,
    Guid? ProductVariantId,
    int Quantity,
    decimal UnitPrice,
    decimal? DiscountPercent,
    decimal FinalUnitPrice,
    decimal LineTotal);
