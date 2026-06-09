using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Application.Services;

public sealed class ProductService : IProductService
{
    private readonly IApplicationDbContext _db;
    private readonly IDiscountResolver _discountResolver;
    private readonly IPriceResolver _priceResolver;
    private readonly ISlugGenerator _slugGenerator;

    public ProductService(
        IApplicationDbContext db,
        IDiscountResolver discountResolver,
        IPriceResolver priceResolver,
        ISlugGenerator slugGenerator)
    {
        _db = db;
        _discountResolver = discountResolver;
        _priceResolver = priceResolver;
        _slugGenerator = slugGenerator;
    }

    public async Task<PagedResult<ProductSummaryDto>> GetProductsAsync(ProductQuery query, CancellationToken cancellationToken = default)
    {
        var productsQuery = ProductReadQuery().Where(p => p.IsActive && p.Brand.IsActive && p.Category.IsActive);

        if (query.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            productsQuery = productsQuery.Where(p => p.Category.Slug == query.CategorySlug);
        }

        if (query.BrandId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BrandId == query.BrandId.Value);
        }

        if (query.MinPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BasePrice >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BasePrice <= query.MaxPrice.Value);
        }

        productsQuery = query.Sort?.ToLowerInvariant() switch
        {
            "price_asc" => productsQuery.OrderBy(p => p.BasePrice),
            "price_desc" => productsQuery.OrderByDescending(p => p.BasePrice),
            "newest" => productsQuery.OrderByDescending(p => p.CreatedAt),
            "name" => productsQuery.OrderBy(p => p.Name),
            _ => productsQuery.OrderByDescending(p => p.IsNew).ThenByDescending(p => p.CreatedAt)
        };

        return await ToPagedSummaryAsync(productsQuery, query.Page, query.PageSize, cancellationToken);
    }

    public async Task<PagedResult<ProductDetailsDto>> GetAdminProductsAsync(ProductQuery query, CancellationToken cancellationToken = default)
    {
        var productsQuery = ProductReadQuery();

        if (query.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            productsQuery = productsQuery.Where(p => p.Category.Slug == query.CategorySlug);
        }

        if (query.BrandId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BrandId == query.BrandId.Value);
        }

        if (query.MinPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BasePrice >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.BasePrice <= query.MaxPrice.Value);
        }

        productsQuery = query.Sort?.ToLowerInvariant() switch
        {
            "price_asc" => productsQuery.OrderBy(p => p.BasePrice),
            "price_desc" => productsQuery.OrderByDescending(p => p.BasePrice),
            "newest" => productsQuery.OrderByDescending(p => p.CreatedAt),
            "name" => productsQuery.OrderBy(p => p.Name),
            _ => productsQuery.OrderByDescending(p => p.CreatedAt)
        };

        return await ToPagedDetailsAsync(productsQuery, query.Page, query.PageSize, cancellationToken);
    }

    public async Task<ProductDetailsDto> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await ProductReadQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive && p.Brand.IsActive && p.Category.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException("المنتج غير موجود");

        return await MapDetailsAsync(product, cancellationToken);
    }

    public async Task<ProductDetailsDto> GetProductBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var product = await ProductReadQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive && p.Brand.IsActive && p.Category.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException("المنتج غير موجود");

        return await MapDetailsAsync(product, cancellationToken);
    }

    public async Task<PagedResult<ProductSummaryDto>> SearchProductsAsync(ProductSearchQuery query, CancellationToken cancellationToken = default)
    {
        var productsQuery = ProductReadQuery().Where(p => p.IsActive && p.Brand.IsActive && p.Category.IsActive);

        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var term = query.Q.Trim();
            productsQuery = productsQuery.Where(p =>
                p.Name.Contains(term) ||
                (p.Description != null && p.Description.Contains(term)) ||
                p.Brand.Name.Contains(term) ||
                p.Category.Name.Contains(term));
        }

        if (query.CategoryId.HasValue)
        {
            productsQuery = productsQuery.Where(p => p.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            productsQuery = productsQuery.Where(p => p.Category.Slug == query.CategorySlug);
        }

        return await ToPagedSummaryAsync(productsQuery.OrderByDescending(p => p.CreatedAt), query.Page, query.PageSize, cancellationToken);
    }

    public async Task<ProductDetailsDto> CreateProductAsync(ProductRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateProductRequestAsync(request, null, cancellationToken);

        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = await EnsureUniqueSlugAsync(request.Slug, request.Name, null, cancellationToken),
            BrandId = request.BrandId,
            CategoryId = request.CategoryId,
            BasePrice = request.BasePrice,
            BaseOldPrice = null,
            Description = request.Description?.Trim(),
            Ingredients = request.Ingredients?.Trim(),
            HowToUse = request.HowToUse?.Trim(),
            SkinType = null,
            IsActive = request.IsActive ?? true,
            IsNew = request.IsNew ?? false
        };

        AddOptions(product, request);
        _db.Products.Add(product);
        await _db.SaveChangesAsync(cancellationToken);
        return await GetAdminProductDetailsAsync(product.Id, cancellationToken);
    }

    public async Task<ProductDetailsDto> UpdateProductAsync(Guid id, ProductRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateProductRequestAsync(request, id, cancellationToken);
        var product = await _db.Products
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("المنتج غير موجود");

        product.Name = request.Name.Trim();
        product.Slug = await EnsureUniqueSlugAsync(request.Slug, request.Name, product.Id, cancellationToken);
        product.BrandId = request.BrandId;
        product.CategoryId = request.CategoryId;
        product.BasePrice = request.BasePrice;
        product.BaseOldPrice = null;
        product.Description = request.Description?.Trim();
        product.Ingredients = request.Ingredients?.Trim();
        product.HowToUse = request.HowToUse?.Trim();
        product.SkinType = null;
        product.IsActive = request.IsActive ?? product.IsActive;
        product.IsNew = request.IsNew ?? product.IsNew;
        product.UpdatedAt = DateTime.UtcNow;

        SyncOptions(product, request);
        await _db.SaveChangesAsync(cancellationToken);
        return await GetAdminProductDetailsAsync(product.Id, cancellationToken);
    }

    public async Task DeleteProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("المنتج غير موجود");

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProductImageDto> AddImageAsync(Guid productId, ProductImageRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            throw new AppValidationException("رابط الصورة مطلوب", new Dictionary<string, string[]>
            {
                [nameof(request.ImageUrl)] = ["رابط الصورة مطلوب"]
            });
        }

        _ = await _db.Products.AnyAsync(p => p.Id == productId, cancellationToken)
            ? true
            : throw new KeyNotFoundException("المنتج غير موجود");

        var image = new ProductImage
        {
            ProductId = productId,
            ImageUrl = request.ImageUrl.Trim(),
            AltText = request.AltText?.Trim(),
            SortOrder = request.SortOrder ?? 0
        };

        _db.ProductImages.Add(image);
        await _db.SaveChangesAsync(cancellationToken);
        return new ProductImageDto(image.Id, image.ImageUrl, image.AltText, image.SortOrder);
    }

    public async Task DeleteImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken = default)
    {
        var image = await _db.ProductImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == productId, cancellationToken)
            ?? throw new KeyNotFoundException("الصورة غير موجودة");

        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProductVideoDto> AddVideoAsync(Guid productId, ProductVideoRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.VideoUrl))
        {
            throw new AppValidationException("رابط الفيديو مطلوب", new Dictionary<string, string[]>
            {
                [nameof(request.VideoUrl)] = ["رابط الفيديو مطلوب"]
            });
        }

        _ = await _db.Products.AnyAsync(p => p.Id == productId, cancellationToken)
            ? true
            : throw new KeyNotFoundException("المنتج غير موجود");

        var video = new ProductVideo
        {
            ProductId = productId,
            VideoUrl = request.VideoUrl.Trim(),
            SortOrder = request.SortOrder ?? 0
        };

        _db.ProductVideos.Add(video);
        await _db.SaveChangesAsync(cancellationToken);
        return new ProductVideoDto(video.Id, video.VideoUrl, video.SortOrder);
    }

    public async Task DeleteVideoAsync(Guid productId, Guid videoId, CancellationToken cancellationToken = default)
    {
        var video = await _db.ProductVideos.FirstOrDefaultAsync(v => v.Id == videoId && v.ProductId == productId, cancellationToken)
            ?? throw new KeyNotFoundException("الفيديو غير موجود");

        _db.ProductVideos.Remove(video);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<Product> ProductReadQuery() =>
        _db.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Videos)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.Variants)
            .Include(p => p.Reviews);

    private async Task<PagedResult<ProductSummaryDto>> ToPagedSummaryAsync(IQueryable<Product> query, int page, int pageSize, CancellationToken cancellationToken)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var total = await query.CountAsync(cancellationToken);
        var products = await query
            .AsNoTracking()
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<ProductSummaryDto>();
        foreach (var product in products)
        {
            items.Add(await MapSummaryAsync(product, cancellationToken));
        }

        return new PagedResult<ProductSummaryDto>(items, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    private async Task<PagedResult<ProductDetailsDto>> ToPagedDetailsAsync(IQueryable<Product> query, int page, int pageSize, CancellationToken cancellationToken)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var total = await query.CountAsync(cancellationToken);
        var products = await query
            .AsNoTracking()
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = new List<ProductDetailsDto>();
        foreach (var product in products)
        {
            items.Add(await MapDetailsAsync(product, cancellationToken));
        }

        return new PagedResult<ProductDetailsDto>(items, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    private async Task<ProductDetailsDto> GetAdminProductDetailsAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await ProductReadQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("المنتج غير موجود");

        return await MapDetailsAsync(product, cancellationToken);
    }

    private async Task<ProductSummaryDto> MapSummaryAsync(Product product, CancellationToken cancellationToken)
    {
        var discount = await _discountResolver.ResolveAsync(product.Id, product.BrandId, DateTime.UtcNow, cancellationToken);
        var effectivePrice = ApplyDiscount(product.BasePrice, discount.Percentage);
        var approvedReviews = product.Reviews.Where(r => r.IsApproved).ToList();

        return new ProductSummaryDto(
            product.Id,
            product.Name,
            product.Slug,
            MapBrand(product.Brand),
            MapCategory(product.Category),
            product.BasePrice,
            effectivePrice,
            discount.Percentage,
            product.Images.OrderBy(i => i.SortOrder).FirstOrDefault()?.ImageUrl,
            product.IsNew,
            approvedReviews.Count == 0 ? 0 : Math.Round(approvedReviews.Average(r => r.Rating), 2),
            approvedReviews.Count);
    }

    private async Task<ProductDetailsDto> MapDetailsAsync(Product product, CancellationToken cancellationToken)
    {
        var discount = await _discountResolver.ResolveAsync(product.Id, product.BrandId, DateTime.UtcNow, cancellationToken);
        var approvedReviews = product.Reviews.Where(r => r.IsApproved).ToList();

        return new ProductDetailsDto(
            product.Id,
            product.Name,
            product.Slug,
            MapBrand(product.Brand),
            MapCategory(product.Category),
            product.BasePrice,
            ApplyDiscount(product.BasePrice, discount.Percentage),
            discount.Percentage,
            product.Description,
            product.Ingredients,
            product.HowToUse,
            product.IsActive,
            product.IsNew,
            product.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.AltText, i.SortOrder)).ToList(),
            product.Videos.OrderBy(v => v.SortOrder).Select(v => new ProductVideoDto(v.Id, v.VideoUrl, v.SortOrder)).ToList(),
            product.Colors.Select(c => new ProductColorDto(c.Id, c.Name, c.HexCode)).ToList(),
            product.Sizes.Select(s => new ProductSizeDto(s.Id, s.Label, s.Price)).ToList(),
            product.Variants.Select(v => new ProductVariantDto(v.Id, v.ProductColorId, v.ProductSizeId, v.Price)).ToList(),
            approvedReviews.Count == 0 ? 0 : Math.Round(approvedReviews.Average(r => r.Rating), 2),
            approvedReviews.Count);
    }

    private async Task ValidateProductRequestAsync(ProductRequest request, Guid? currentProductId, CancellationToken cancellationToken)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.Name), request.Name, "اسم المنتج مطلوب");
        ValidationHelper.NonNegative(fields, nameof(request.BasePrice), request.BasePrice);
        if (request.BasePrice <= 0)
        {
            fields[nameof(request.BasePrice)] = ["السعر يجب أن يكون أكبر من صفر"];
        }

        var colorNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var (color, index) in (request.Colors ?? []).Select((value, index) => (value, index)))
        {
            ValidationHelper.Required(fields, $"colors[{index}].name", color.Name, "اسم اللون مطلوب");
            ValidationHelper.HexColor(fields, $"colors[{index}].hexCode", color.HexCode);
            var colorName = color.Name?.Trim();
            if (!string.IsNullOrWhiteSpace(colorName) && !colorNames.Add(colorName))
            {
                fields[$"colors[{index}].name"] = ["هذا اللون مضاف مسبقا"];
            }
        }

        foreach (var (size, index) in (request.Sizes ?? []).Select((value, index) => (value, index)))
        {
            ValidationHelper.Required(fields, $"sizes[{index}].label", size.Label, "اسم الحجم مطلوب");
            ValidationHelper.NonNegative(fields, $"sizes[{index}].price", size.Price);
        }

        foreach (var (variant, index) in (request.Variants ?? []).Select((value, index) => (value, index)))
        {
            ValidationHelper.NonNegative(fields, $"variants[{index}].price", variant.Price);
        }

        ValidationHelper.ThrowIfInvalid(fields);

        if (!await _db.Brands.AnyAsync(b => b.Id == request.BrandId, cancellationToken))
        {
            throw new KeyNotFoundException("العلامة التجارية غير موجودة");
        }

        if (!await _db.Categories.AnyAsync(c => c.Id == request.CategoryId, cancellationToken))
        {
            throw new KeyNotFoundException("التصنيف غير موجود");
        }

        var slug = _slugGenerator.GenerateSlug(string.IsNullOrWhiteSpace(request.Slug) ? request.Name : request.Slug);
        var slugExists = await _db.Products.AnyAsync(
            p => p.Slug == slug && (!currentProductId.HasValue || p.Id != currentProductId.Value),
            cancellationToken);

        if (slugExists && !string.IsNullOrWhiteSpace(request.Slug))
        {
            throw new AppValidationException("رابط المنتج مستخدم مسبقا", new Dictionary<string, string[]>
            {
                [nameof(request.Slug)] = ["رابط المنتج مستخدم مسبقا"]
            });
        }
    }

    private async Task<string> EnsureUniqueSlugAsync(string? requestedSlug, string name, Guid? currentId, CancellationToken cancellationToken)
    {
        var slug = _slugGenerator.GenerateSlug(string.IsNullOrWhiteSpace(requestedSlug) ? name : requestedSlug);
        var baseSlug = slug;
        var suffix = 2;
        while (await _db.Products.AnyAsync(p => p.Slug == slug && (!currentId.HasValue || p.Id != currentId.Value), cancellationToken))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }

    private static void AddOptions(Product product, ProductRequest request)
    {
        foreach (var color in request.Colors ?? [])
        {
            product.Colors.Add(new ProductColor
            {
                Id = color.Id ?? Guid.NewGuid(),
                Name = color.Name.Trim(),
                HexCode = color.HexCode.Trim()
            });
        }

        foreach (var size in request.Sizes ?? [])
        {
            product.Sizes.Add(new ProductSize
            {
                Id = size.Id ?? Guid.NewGuid(),
                Label = size.Label.Trim(),
                Price = size.Price,
                OldPrice = null,
                Stock = null,
                SKU = null
            });
        }

        foreach (var variant in request.Variants ?? [])
        {
            product.Variants.Add(new ProductVariant
            {
                Id = variant.Id ?? Guid.NewGuid(),
                ProductColorId = variant.ProductColorId,
                ProductSizeId = variant.ProductSizeId,
                Price = variant.Price,
                OldPrice = null,
                Stock = 0,
                SKU = null
            });
        }
    }

    private static void ValidateOptionOwnership(Product product, ProductRequest request)
    {
        var fields = new Dictionary<string, string[]>();
        var productColorIds = product.Colors.Select(c => c.Id).ToHashSet();
        var productSizeIds = product.Sizes.Select(s => s.Id).ToHashSet();
        var productVariantIds = product.Variants.Select(v => v.Id).ToHashSet();

        foreach (var (color, index) in (request.Colors ?? []).Select((value, index) => (value, index)))
        {
            if (color.Id.HasValue && !productColorIds.Contains(color.Id.Value))
            {
                fields[$"colors[{index}].id"] = ["اللون المحدد لا يتبع هذا المنتج"];
            }
        }

        foreach (var (size, index) in (request.Sizes ?? []).Select((value, index) => (value, index)))
        {
            if (size.Id.HasValue && !productSizeIds.Contains(size.Id.Value))
            {
                fields[$"sizes[{index}].id"] = ["الحجم المحدد لا يتبع هذا المنتج"];
            }
        }

        foreach (var (variant, index) in (request.Variants ?? []).Select((value, index) => (value, index)))
        {
            if (variant.Id.HasValue && !productVariantIds.Contains(variant.Id.Value))
            {
                fields[$"variants[{index}].id"] = ["الخيار المحدد لا يتبع هذا المنتج"];
            }
        }

        if (fields.Count > 0)
        {
            throw new AppValidationException("تعذر تحديث خيارات المنتج", fields);
        }
    }

    private void SyncOptions(Product product, ProductRequest request)
    {
        ValidateOptionOwnership(product, request);

        var removedColorIds = new HashSet<Guid>();
        var removedSizeIds = new HashSet<Guid>();

        if (request.Colors is not null)
        {
            var requestedColorIds = request.Colors
                .Where(c => c.Id.HasValue)
                .Select(c => c.Id!.Value)
                .ToHashSet();
            var colorsToRemove = product.Colors
                .Where(c => !requestedColorIds.Contains(c.Id))
                .ToList();

            removedColorIds = colorsToRemove.Select(c => c.Id).ToHashSet();
            _db.ProductColors.RemoveRange(colorsToRemove);
        }

        if (request.Sizes is not null)
        {
            var requestedSizeIds = request.Sizes
                .Where(s => s.Id.HasValue)
                .Select(s => s.Id!.Value)
                .ToHashSet();
            var sizesToRemove = product.Sizes
                .Where(s => !requestedSizeIds.Contains(s.Id))
                .ToList();

            removedSizeIds = sizesToRemove.Select(s => s.Id).ToHashSet();
            _db.ProductSizes.RemoveRange(sizesToRemove);
        }

        if (request.Variants is not null || removedColorIds.Count > 0 || removedSizeIds.Count > 0)
        {
            var requestedVariantIds = (request.Variants ?? [])
                .Where(v => v.Id.HasValue)
                .Select(v => v.Id!.Value)
                .ToHashSet();
            var variantsToRemove = product.Variants
                .Where(v =>
                    (request.Variants is not null && !requestedVariantIds.Contains(v.Id)) ||
                    (v.ProductColorId.HasValue && removedColorIds.Contains(v.ProductColorId.Value)) ||
                    (v.ProductSizeId.HasValue && removedSizeIds.Contains(v.ProductSizeId.Value)))
                .ToList();

            _db.ProductVariants.RemoveRange(variantsToRemove);
        }

        if (request.Colors is not null)
        {
            foreach (var colorRequest in request.Colors)
            {
                var color = colorRequest.Id.HasValue
                    ? product.Colors.FirstOrDefault(c => c.Id == colorRequest.Id.Value)
                    : null;

                if (color is null)
                {
                    _db.ProductColors.Add(new ProductColor
                    {
                        Id = colorRequest.Id ?? Guid.NewGuid(),
                        ProductId = product.Id,
                        Name = colorRequest.Name.Trim(),
                        HexCode = colorRequest.HexCode.Trim()
                    });
                }
                else
                {
                    color.Name = colorRequest.Name.Trim();
                    color.HexCode = colorRequest.HexCode.Trim();
                }
            }
        }

        if (request.Sizes is not null)
        {
            foreach (var sizeRequest in request.Sizes)
            {
                var size = sizeRequest.Id.HasValue
                    ? product.Sizes.FirstOrDefault(s => s.Id == sizeRequest.Id.Value)
                    : null;

                if (size is null)
                {
                    _db.ProductSizes.Add(new ProductSize
                    {
                        Id = sizeRequest.Id ?? Guid.NewGuid(),
                        ProductId = product.Id,
                        Label = sizeRequest.Label.Trim(),
                        Price = sizeRequest.Price,
                        OldPrice = null,
                        Stock = null,
                        SKU = null
                    });
                }
                else
                {
                    size.Label = sizeRequest.Label.Trim();
                    size.Price = sizeRequest.Price;
                    size.OldPrice = null;
                    size.Stock = null;
                    size.SKU = null;
                    size.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        if (request.Variants is not null)
        {
            foreach (var variantRequest in request.Variants)
            {
                var variant = variantRequest.Id.HasValue
                    ? product.Variants.FirstOrDefault(v => v.Id == variantRequest.Id.Value)
                    : null;

                if (variant is null)
                {
                    _db.ProductVariants.Add(new ProductVariant
                    {
                        Id = variantRequest.Id ?? Guid.NewGuid(),
                        ProductId = product.Id,
                        ProductColorId = variantRequest.ProductColorId,
                        ProductSizeId = variantRequest.ProductSizeId,
                        Price = variantRequest.Price,
                        OldPrice = null,
                        Stock = 0,
                        SKU = null
                    });
                }
                else
                {
                    variant.ProductColorId = variantRequest.ProductColorId;
                    variant.ProductSizeId = variantRequest.ProductSizeId;
                    variant.Price = variantRequest.Price;
                    variant.OldPrice = null;
                    variant.Stock = 0;
                    variant.SKU = null;
                    variant.UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }

    private static decimal ApplyDiscount(decimal price, decimal? percentage) =>
        percentage.HasValue ? Math.Round(price - (price * percentage.Value / 100m), 2) : price;

    private static BrandDto MapBrand(Brand brand) => new(brand.Id, brand.Name, brand.Slug, brand.Description, brand.ImageUrl, brand.IsActive);

    private static CategoryDto MapCategory(Category category) => new(category.Id, category.Name, category.Slug, category.Description, category.ImageUrl, category.IsActive);
}
