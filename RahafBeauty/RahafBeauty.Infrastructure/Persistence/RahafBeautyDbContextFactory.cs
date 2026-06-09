using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RahafBeauty.Infrastructure.Persistence;

public sealed class RahafBeautyDbContextFactory : IDesignTimeDbContextFactory<RahafBeautyDbContext>
{
    public RahafBeautyDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<RahafBeautyDbContext>();
        var connectionString = Environment.GetEnvironmentVariable("RAHAFBEAUTY_CONNECTION")
            ?? "Server=(localdb)\\MSSQLLocalDB;Database=RahafBeautyDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

        optionsBuilder.UseSqlServer(connectionString);
        return new RahafBeautyDbContext(optionsBuilder.Options);
    }
}
