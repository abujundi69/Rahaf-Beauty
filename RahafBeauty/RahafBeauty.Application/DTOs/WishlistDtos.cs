namespace RahafBeauty.Application.DTOs;

public sealed record AddWishlistItemRequest(Guid ProductId);

public sealed record WishlistDto(Guid Id, IReadOnlyList<WishlistItemDto> Items);

public sealed record WishlistItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string Slug,
    string? ImageUrl,
    decimal BasePrice);
