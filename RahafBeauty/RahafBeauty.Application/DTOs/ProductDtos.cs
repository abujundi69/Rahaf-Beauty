namespace RahafBeauty.Application.DTOs;

public sealed record ProductQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    string? CategorySlug = null,
    Guid? BrandId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? Sort = null);

public sealed record ProductSearchQuery(
    string? Q,
    int Page = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    string? CategorySlug = null);

public sealed record ProductRequest(
    string Name,
    string? Slug,
    string? BrandName,
    Guid? BrandId,
    Guid CategoryId,
    decimal BasePrice,
    string? Description,
    string? Ingredients,
    string? HowToUse,
    bool? IsActive,
    bool? IsNew,
    IReadOnlyList<ProductColorRequest>? Colors,
    IReadOnlyList<ProductSizeRequest>? Sizes,
    IReadOnlyList<ProductVariantRequest>? Variants);

public sealed record ProductColorRequest(Guid? Id, string Name, string HexCode);

public sealed record ProductSizeRequest(
    Guid? Id,
    string Label,
    decimal? Price);

public sealed record ProductVariantRequest(
    Guid? Id,
    Guid? ProductColorId,
    Guid? ProductSizeId,
    decimal? Price);

public sealed record ProductSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    BrandDto? Brand,
    string? BrandName,
    CategoryDto Category,
    decimal BasePrice,
    decimal EffectivePrice,
    decimal? DiscountPercent,
    string? MainImageUrl,
    bool IsNew,
    IReadOnlyList<ProductColorDto> Colors,
    IReadOnlyList<ProductSizeDto> Sizes,
    IReadOnlyList<ProductVariantDto> Variants,
    double AverageRating,
    int ReviewCount);

public sealed record ProductDetailsDto(
    Guid Id,
    string Name,
    string Slug,
    BrandDto? Brand,
    string? BrandName,
    CategoryDto Category,
    decimal BasePrice,
    decimal EffectivePrice,
    decimal? DiscountPercent,
    string? Description,
    string? Ingredients,
    string? HowToUse,
    bool IsActive,
    bool IsNew,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductVideoDto> Videos,
    IReadOnlyList<ProductColorDto> Colors,
    IReadOnlyList<ProductSizeDto> Sizes,
    IReadOnlyList<ProductVariantDto> Variants,
    double AverageRating,
    int ReviewCount);

public sealed record ProductImageRequest(string ImageUrl, string? AltText, int? SortOrder);

public sealed record ProductImageDto(Guid Id, string ImageUrl, string? AltText, int SortOrder);

public sealed record ProductVideoRequest(string VideoUrl, int? SortOrder);

public sealed record ProductVideoDto(Guid Id, string VideoUrl, int SortOrder);

public sealed record ProductColorDto(Guid Id, string Name, string HexCode);

public sealed record ProductSizeDto(
    Guid Id,
    string Label,
    decimal? Price);

public sealed record ProductVariantDto(
    Guid Id,
    Guid? ProductColorId,
    Guid? ProductSizeId,
    decimal? Price);

public sealed record DiscountResolutionDto(Guid? DiscountId, decimal? Percentage, string? Label);

public sealed record ProductPriceContext(decimal BasePrice, decimal? SizePrice, decimal? VariantPrice);
