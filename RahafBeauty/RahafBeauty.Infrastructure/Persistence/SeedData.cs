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
    public static async Task EnsureSeedDataAsync(this IServiceProvider services, ILogger logger, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RahafBeautyDbContext>();
        var passwordService = scope.ServiceProvider.GetRequiredService<IPasswordService>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await db.Database.MigrateAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var seedAdminPhone = configuration["SeedAdmin:PhoneNumber"]?.Trim();
        var seedAdminPassword = configuration["SeedAdmin:Password"];
        var seedAdminFullName = configuration["SeedAdmin:FullName"]?.Trim();

        if (!string.IsNullOrWhiteSpace(seedAdminPhone) &&
            !string.IsNullOrWhiteSpace(seedAdminPassword) &&
            seedAdminPhone.Length == 10 &&
            seedAdminPhone.All(char.IsDigit))
        {
            var admin = await db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == seedAdminPhone, cancellationToken);
            if (admin is null)
            {
                admin = new User
                {
                    FullName = string.IsNullOrWhiteSpace(seedAdminFullName) ? "مدير RAHAF BEAUTY" : seedAdminFullName,
                    PhoneNumber = seedAdminPhone,
                    Email = seedAdminPhone,
                    PasswordHash = passwordService.HashPassword(seedAdminPassword),
                    Role = UserRole.Admin,
                    IsDeleted = false,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                db.Users.Add(admin);
            }
            else if (!admin.IsDeleted)
            {
                admin.FullName = string.IsNullOrWhiteSpace(admin.FullName)
                    ? (string.IsNullOrWhiteSpace(seedAdminFullName) ? "مدير RAHAF BEAUTY" : seedAdminFullName)
                    : admin.FullName;
                admin.Email = seedAdminPhone;
                admin.Role = UserRole.Admin;
                admin.PasswordHash = passwordService.HashPassword(seedAdminPassword);
                admin.UpdatedAt = now;
            }
        }
        else
        {
            logger.LogInformation("Seed admin is not configured.");
        }

        if (!await db.StoreSettings.AnyAsync(cancellationToken))
        {
            db.StoreSettings.Add(new StoreSettings
            {
                StoreName = "RAHAF BEAUTY",
                Currency = "SAR",
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
        logger.LogInformation("Rahaf Beauty seed data is ready.");
    }
}
