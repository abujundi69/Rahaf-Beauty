using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Infrastructure.Persistence.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FullName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(320);
        builder.Property(x => x.PhoneNumber).HasMaxLength(40);
        builder.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Role).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Email).IsUnique().HasFilter("[Email] IS NOT NULL AND [IsDeleted] = 0");
        builder.HasIndex(x => x.PhoneNumber).IsUnique().HasFilter("[PhoneNumber] IS NOT NULL AND [IsDeleted] = 0");
        builder.HasIndex(x => x.Role);
        builder.HasIndex(x => x.IsDeleted);

        builder.HasOne(x => x.CustomerProfile)
            .WithOne(x => x.User)
            .HasForeignKey<CustomerProfile>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.CustomerAddresses)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Cart)
            .WithOne(x => x.User)
            .HasForeignKey<Cart>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Wishlist)
            .WithOne(x => x.User)
            .HasForeignKey<Wishlist>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Orders)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.ProductReviews)
            .WithOne(x => x.User)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class CustomerProfileConfiguration : IEntityTypeConfiguration<CustomerProfile>
{
    public void Configure(EntityTypeBuilder<CustomerProfile> builder)
    {
        builder.ToTable("CustomerProfiles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PreferredName).HasMaxLength(150);
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}

internal sealed class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.ToTable("CustomerAddresses");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.City).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Area).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Street).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Building).HasMaxLength(100);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.UserId, x.IsDefault }).HasFilter("[IsDefault] = 1");
    }
}

internal sealed class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("Brands");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(220).IsRequired();
        builder.Property(x => x.ImageUrl).HasMaxLength(1000);
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.IsActive);
    }
}

internal sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(220).IsRequired();
        builder.Property(x => x.ImageUrl).HasMaxLength(1000);
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.IsActive);
    }
}

internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(250).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(280).IsRequired();
        builder.Property(x => x.BasePrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.BaseOldPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.SkinType).HasMaxLength(200);
        builder.HasIndex(x => x.Slug).IsUnique();
        builder.HasIndex(x => x.BrandId);
        builder.HasIndex(x => x.CategoryId);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.IsNew);

        builder.HasOne(x => x.Brand)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Category)
            .WithMany(x => x.Products)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ImageUrl).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.AltText).HasMaxLength(250);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => new { x.ProductId, x.SortOrder });
        builder.HasOne(x => x.Product).WithMany(x => x.Images).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class ProductVideoConfiguration : IEntityTypeConfiguration<ProductVideo>
{
    public void Configure(EntityTypeBuilder<ProductVideo> builder)
    {
        builder.ToTable("ProductVideos");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.VideoUrl).HasMaxLength(1000).IsRequired();
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => new { x.ProductId, x.SortOrder });
        builder.HasOne(x => x.Product).WithMany(x => x.Videos).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class ProductColorConfiguration : IEntityTypeConfiguration<ProductColor>
{
    public void Configure(EntityTypeBuilder<ProductColor> builder)
    {
        builder.ToTable("ProductColors");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(120).IsRequired();
        builder.Property(x => x.HexCode).HasMaxLength(20).IsRequired();
        builder.HasIndex(x => x.ProductId);
        builder.HasOne(x => x.Product).WithMany(x => x.Colors).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class ProductSizeConfiguration : IEntityTypeConfiguration<ProductSize>
{
    public void Configure(EntityTypeBuilder<ProductSize> builder)
    {
        builder.ToTable("ProductSizes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Label).HasMaxLength(80).IsRequired();
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        builder.Property(x => x.OldPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.SKU).HasMaxLength(120);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => new { x.ProductId, x.Label }).IsUnique();
        builder.HasIndex(x => x.SKU).IsUnique().HasFilter("[SKU] IS NOT NULL");
        builder.HasOne(x => x.Product).WithMany(x => x.Sizes).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("ProductVariants");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        builder.Property(x => x.OldPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.SKU).HasMaxLength(120);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.ProductColorId);
        builder.HasIndex(x => x.ProductSizeId);
        builder.HasIndex(x => new { x.ProductId, x.ProductColorId, x.ProductSizeId }).IsUnique();
        builder.HasIndex(x => x.SKU).IsUnique().HasFilter("[SKU] IS NOT NULL");
        builder.HasOne(x => x.Product).WithMany(x => x.Variants).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.ProductColor).WithMany(x => x.Variants).HasForeignKey(x => x.ProductColorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ProductSize).WithMany(x => x.Variants).HasForeignKey(x => x.ProductSizeId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class WishlistConfiguration : IEntityTypeConfiguration<Wishlist>
{
    public void Configure(EntityTypeBuilder<Wishlist> builder)
    {
        builder.ToTable("Wishlists");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}

internal sealed class WishlistItemConfiguration : IEntityTypeConfiguration<WishlistItem>
{
    public void Configure(EntityTypeBuilder<WishlistItem> builder)
    {
        builder.ToTable("WishlistItems");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.WishlistId);
        builder.HasIndex(x => new { x.WishlistId, x.ProductId }).IsUnique();
        builder.HasOne(x => x.Wishlist).WithMany(x => x.Items).HasForeignKey(x => x.WishlistId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany(x => x.WishlistItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.ToTable("Carts");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}

internal sealed class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItems");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DiscountPercent).HasColumnType("decimal(5,2)");
        builder.Property(x => x.FinalUnitPrice).HasColumnType("decimal(18,2)");
        builder.HasIndex(x => x.CartId);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => new { x.CartId, x.ProductId, x.ProductSizeId, x.ProductColorId, x.ProductVariantId }).IsUnique();
        builder.HasOne(x => x.Cart).WithMany(x => x.Items).HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany(x => x.CartItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ProductSize).WithMany(x => x.CartItems).HasForeignKey(x => x.ProductSizeId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ProductColor).WithMany(x => x.CartItems).HasForeignKey(x => x.ProductColorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ProductVariant).WithMany(x => x.CartItems).HasForeignKey(x => x.ProductVariantId).OnDelete(DeleteBehavior.Restrict);
    }
}

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OrderNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.CustomerNameSnapshot).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CustomerPhoneSnapshot).HasMaxLength(40);
        builder.Property(x => x.CustomerEmailSnapshot).HasMaxLength(320);
        builder.Property(x => x.City).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Area).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Street).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Building).HasMaxLength(100);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DiscountTotal).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DeliveryFee).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Total).HasColumnType("decimal(18,2)");
        builder.Property(x => x.PaymentMethod).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.PaymentStatus).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
        builder.HasIndex(x => x.OrderNumber).IsUnique();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.PaymentStatus);
    }
}

internal sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ProductNameSnapshot).HasMaxLength(250).IsRequired();
        builder.Property(x => x.BrandNameSnapshot).HasMaxLength(200);
        builder.Property(x => x.CategoryNameSnapshot).HasMaxLength(200);
        builder.Property(x => x.ProductSizeLabelSnapshot).HasMaxLength(80);
        builder.Property(x => x.ProductColorNameSnapshot).HasMaxLength(120);
        builder.Property(x => x.ProductColorHexSnapshot).HasMaxLength(20);
        builder.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.DiscountPercent).HasColumnType("decimal(5,2)");
        builder.Property(x => x.FinalUnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(x => x.LineTotal).HasColumnType("decimal(18,2)");
        builder.HasIndex(x => x.OrderId);
        builder.HasIndex(x => x.ProductId);
        builder.HasOne(x => x.Order).WithMany(x => x.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.Product).WithMany(x => x.OrderItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.SetNull);
    }
}

internal sealed class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("OrderStatusHistory");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.Note).HasMaxLength(1000);
        builder.HasIndex(x => x.OrderId);
        builder.HasIndex(x => x.ChangedAt);
        builder.HasIndex(x => x.ChangedByUserId);
        builder.HasOne(x => x.Order).WithMany(x => x.StatusHistory).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.ChangedByUser).WithMany().HasForeignKey(x => x.ChangedByUserId).OnDelete(DeleteBehavior.SetNull);
    }
}

internal sealed class ProductReviewConfiguration : IEntityTypeConfiguration<ProductReview>
{
    public void Configure(EntityTypeBuilder<ProductReview> builder)
    {
        builder.ToTable("ProductReviews");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.OrderId);
        builder.HasIndex(x => x.IsApproved);
        builder.HasIndex(x => new { x.ProductId, x.UserId, x.OrderId }).IsUnique().HasFilter("[OrderId] IS NOT NULL");
        builder.HasOne(x => x.Product).WithMany(x => x.Reviews).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Order).WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.SetNull);
    }
}

internal sealed class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(EntityTypeBuilder<StoreSettings> builder)
    {
        builder.ToTable("StoreSettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.StoreName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.LogoUrl).HasMaxLength(1000);
        builder.Property(x => x.ContactEmail).HasMaxLength(320);
        builder.Property(x => x.Phone).HasMaxLength(40);
        builder.Property(x => x.Address).HasMaxLength(1000);
        builder.Property(x => x.Currency).HasMaxLength(10).IsRequired();
    }
}

internal sealed class AnnouncementSettingsConfiguration : IEntityTypeConfiguration<AnnouncementSettings>
{
    public void Configure(EntityTypeBuilder<AnnouncementSettings> builder)
    {
        builder.ToTable("AnnouncementSettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Text).HasMaxLength(500).IsRequired();
        builder.Property(x => x.BackgroundColor).HasMaxLength(20).IsRequired();
        builder.Property(x => x.TextColor).HasMaxLength(20).IsRequired();
        builder.Property(x => x.LinkText).HasMaxLength(120);
        builder.Property(x => x.LinkUrl).HasMaxLength(1000);
        builder.HasIndex(x => x.IsEnabled);
        builder.HasIndex(x => new { x.StartDate, x.EndDate });
    }
}

internal sealed class DiscountConfiguration : IEntityTypeConfiguration<Discount>
{
    public void Configure(EntityTypeBuilder<Discount> builder)
    {
        builder.ToTable("Discounts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.Percentage).HasColumnType("decimal(5,2)");
        builder.Property(x => x.Label).HasMaxLength(150);
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.ScopeId);
        builder.HasIndex(x => x.IsEnabled);
        builder.HasIndex(x => new { x.StartDate, x.EndDate });
    }
}

internal sealed class AdminNotificationConfiguration : IEntityTypeConfiguration<AdminNotification>
{
    public void Configure(EntityTypeBuilder<AdminNotification> builder)
    {
        builder.ToTable("AdminNotifications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Message).HasMaxLength(1000);
        builder.HasIndex(x => x.IsRead);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => x.OrderId);
        builder.HasOne(x => x.Order).WithMany(x => x.AdminNotifications).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.SetNull);
    }
}

internal sealed class SystemMediaConfiguration : IEntityTypeConfiguration<SystemMedia>
{
    public void Configure(EntityTypeBuilder<SystemMedia> builder)
    {
        builder.ToTable("SystemMedia");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OwnerType).HasMaxLength(80).IsRequired();
        builder.Property(x => x.FileUrl).HasMaxLength(1000).IsRequired();
        builder.Property(x => x.FileType).HasConversion<string>().HasMaxLength(50);
        builder.Property(x => x.FileName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.MimeType).HasMaxLength(120).IsRequired();
        builder.HasIndex(x => new { x.OwnerType, x.OwnerId });
        builder.HasIndex(x => x.FileType);
    }
}
