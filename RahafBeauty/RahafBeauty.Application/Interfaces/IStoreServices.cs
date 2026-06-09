using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.Interfaces;

public interface IAccountService
{
    Task<CustomerProfileDto> GetProfileAsync(CancellationToken cancellationToken = default);
    Task<CustomerProfileDto> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AddressDto>> GetAddressesAsync(CancellationToken cancellationToken = default);
    Task<AddressDto> CreateAddressAsync(AddressRequest request, CancellationToken cancellationToken = default);
    Task<AddressDto> UpdateAddressAsync(Guid id, AddressRequest request, CancellationToken cancellationToken = default);
    Task DeleteAddressAsync(Guid id, CancellationToken cancellationToken = default);
    Task<AddressDto> SetDefaultAddressAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateUserInfoAsync(UpdateUserInfoRequest request, CancellationToken cancellationToken = default);
    Task ChangePasswordAsync(ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task ChangeEmailAsync(ChangeEmailRequest request, CancellationToken cancellationToken = default);
    Task DeleteCurrentCustomerAsync(CancellationToken cancellationToken = default);
}

public interface IProductService
{
    Task<PagedResult<ProductSummaryDto>> GetProductsAsync(ProductQuery query, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductSummaryDto>> GetMostOrderedAsync(int limit = 4, CancellationToken cancellationToken = default);
    Task<PagedResult<ProductDetailsDto>> GetAdminProductsAsync(ProductQuery query, CancellationToken cancellationToken = default);
    Task<ProductDetailsDto> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductDetailsDto> GetProductBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<PagedResult<ProductSummaryDto>> SearchProductsAsync(ProductSearchQuery query, CancellationToken cancellationToken = default);
    Task<ProductDetailsDto> CreateProductAsync(ProductRequest request, CancellationToken cancellationToken = default);
    Task<ProductDetailsDto> UpdateProductAsync(Guid id, ProductRequest request, CancellationToken cancellationToken = default);
    Task DeleteProductAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductImageDto> AddImageAsync(Guid productId, ProductImageRequest request, CancellationToken cancellationToken = default);
    Task DeleteImageAsync(Guid productId, Guid imageId, CancellationToken cancellationToken = default);
    Task<ProductVideoDto> AddVideoAsync(Guid productId, ProductVideoRequest request, CancellationToken cancellationToken = default);
    Task DeleteVideoAsync(Guid productId, Guid videoId, CancellationToken cancellationToken = default);
}

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<CategoryDto> CreateAsync(CategoryRequest request, CancellationToken cancellationToken = default);
    Task<CategoryDto> UpdateAsync(Guid id, CategoryRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IBrandService
{
    Task<IReadOnlyList<BrandDto>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<BrandDto> CreateAsync(BrandRequest request, CancellationToken cancellationToken = default);
    Task<BrandDto> UpdateAsync(Guid id, BrandRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ICartService
{
    Task<CartDto> GetCartAsync(CancellationToken cancellationToken = default);
    Task<CartDto> AddItemAsync(AddCartItemRequest request, CancellationToken cancellationToken = default);
    Task<CartDto> UpdateItemAsync(Guid id, UpdateCartItemRequest request, CancellationToken cancellationToken = default);
    Task DeleteItemAsync(Guid id, CancellationToken cancellationToken = default);
    Task ClearAsync(CancellationToken cancellationToken = default);
}

public interface IWishlistService
{
    Task<WishlistDto> GetWishlistAsync(CancellationToken cancellationToken = default);
    Task<WishlistDto> AddItemAsync(AddWishlistItemRequest request, CancellationToken cancellationToken = default);
    Task DeleteItemAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<ReorderResultDto> ReorderAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderSummaryDto>> GetMyOrdersAsync(CancellationToken cancellationToken = default);
    Task<OrderDto> GetMyOrderAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<OrderSummaryDto>> GetAdminOrdersAsync(AdminOrderQuery query, CancellationToken cancellationToken = default);
    Task<OrderDto> GetAdminOrderAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrderDto> ApproveAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrderDto> RejectAsync(Guid id, RejectOrderRequest request, CancellationToken cancellationToken = default);
    Task<OrderDto> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default);
}

public interface IReviewService
{
    Task<PagedResult<ReviewDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<ReviewDto> CreateAsync(Guid productId, CreateReviewRequest request, CancellationToken cancellationToken = default);
}

public interface ISettingsService
{
    Task<AdminSettingsDto> GetAdminSettingsAsync(CancellationToken cancellationToken = default);
    Task<StoreSettingsDto> UpdateStoreSettingsAsync(StoreSettingsRequest request, CancellationToken cancellationToken = default);
    Task<AnnouncementDto> GetAnnouncementAsync(CancellationToken cancellationToken = default);
    Task<AnnouncementDto> UpdateAnnouncementAsync(AnnouncementRequest request, CancellationToken cancellationToken = default);
}

public interface IDiscountService
{
    Task<IReadOnlyList<DiscountDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<DiscountDto> CreateAsync(DiscountRequest request, CancellationToken cancellationToken = default);
    Task<DiscountDto> UpdateAsync(Guid id, DiscountRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface INotificationService
{
    Task<PagedResult<AdminNotificationDto>> GetAdminNotificationsAsync(NotificationQuery query, CancellationToken cancellationToken = default);
    Task MarkReadAsync(Guid id, CancellationToken cancellationToken = default);
    Task MarkAllReadAsync(CancellationToken cancellationToken = default);
}

public interface IDiscountResolver
{
    Task<DiscountResolutionDto> ResolveAsync(Guid productId, Guid? brandId, DateTime utcNow, CancellationToken cancellationToken = default);
}

public interface IPriceResolver
{
    decimal ResolveUnitPrice(ProductPriceContext context);
}

public interface IOrderNumberGenerator
{
    Task<string> GenerateAsync(CancellationToken cancellationToken = default);
}

public interface ISlugGenerator
{
    string GenerateSlug(string value);
}
