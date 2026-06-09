using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Domain.Entities;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task EnsureSeedDataAsync(
        this IServiceProvider services,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<RahafBeautyDbContext>();
        var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await db.Database.MigrateAsync(cancellationToken);

        var now = DateTime.UtcNow;

        // Default Admin Account
        var seedAdminPhone = configuration["SeedAdmin:PhoneNumber"]?.Trim();
        var seedAdminPassword = configuration["SeedAdmin:Password"];
        var seedAdminFullName = configuration["SeedAdmin:FullName"]?.Trim();

        // Fallback ثابت لو مش موجود بالـ appsettings
        seedAdminPhone = string.IsNullOrWhiteSpace(seedAdminPhone)
            ? "0592137484"
            : seedAdminPhone;

        seedAdminPassword = string.IsNullOrWhiteSpace(seedAdminPassword)
            ? "rahaf@2025"
            : seedAdminPassword;

        seedAdminFullName = string.IsNullOrWhiteSpace(seedAdminFullName)
            ? "مدير RAHAF BEAUTY"
            : seedAdminFullName;

        if (seedAdminPhone.Length != 10 || !seedAdminPhone.All(char.IsDigit))
        {
            logger.LogWarning("Seed admin phone number is invalid. Admin was not seeded.");
        }
        else
        {
            var admin = await db.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == seedAdminPhone, cancellationToken);

            if (admin is null)
            {
                admin = new User
                {
                    FullName = seedAdminFullName,
                    PhoneNumber = seedAdminPhone,

                    // حسب طلبك: رقم الهاتف هو الإيميل/اللوجين
                    Email = seedAdminPhone,

                    PasswordHash = passwordService.HashPassword(seedAdminPassword),
                    Role = UserRole.Admin,
                    IsDeleted = false,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                db.Users.Add(admin);
            }
            else
            {
                admin.FullName = seedAdminFullName;
                admin.PhoneNumber = seedAdminPhone;

                // حسب طلبك: رقم الهاتف هو الإيميل/اللوجين
                admin.Email = seedAdminPhone;

                admin.PasswordHash = passwordService.HashPassword(seedAdminPassword);
                admin.Role = UserRole.Admin;
                admin.IsDeleted = false;
                admin.UpdatedAt = now;
            }
        }

        if (!await db.StoreSettings.AnyAsync(cancellationToken))
        {
            db.StoreSettings.Add(new StoreSettings
            {
                StoreName = "RAHAF BEAUTY",
                Currency = "ILS",
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        if (!await db.AnnouncementSettings.AnyAsync(cancellationToken))
        {
            db.AnnouncementSettings.Add(new AnnouncementSettings
            {
                IsEnabled = false,
                Text = "",
                BackgroundColor = "#000000",
                TextColor = "#FFFFFF",
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Rahaf Beauty seed data is ready. Admin phone: {PhoneNumber}", seedAdminPhone);
    }
}