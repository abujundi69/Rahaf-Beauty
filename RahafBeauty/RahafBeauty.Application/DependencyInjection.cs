using Microsoft.Extensions.DependencyInjection;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services;
using RahafBeauty.Application.Services.Helpers;

namespace RahafBeauty.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAccountService, AccountService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IWishlistService, WishlistService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<IDiscountService, DiscountService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IDiscountResolver, DiscountResolver>();
        services.AddScoped<IPriceResolver, PriceResolver>();
        services.AddScoped<IOrderNumberGenerator, OrderNumberGenerator>();
        services.AddSingleton<ISlugGenerator, SlugGenerator>();
        services.AddSingleton<IPasswordService, PasswordService>();
        return services;
    }
}
