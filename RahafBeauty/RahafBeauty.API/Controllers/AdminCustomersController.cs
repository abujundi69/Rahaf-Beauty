using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/admin/customers")]
[Authorize(Roles = "Admin")]
[Tags("Admin Customers")]
public sealed class AdminCustomersController : ControllerBase
{
    private readonly IApplicationDbContext _db;

    public AdminCustomersController(IApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var customers = await _db.Users
            .AsNoTracking()
            .Where(user => user.Role == UserRole.Customer && !user.IsDeleted)
            .OrderBy(user => user.FullName)
            .Select(user => new AdminCustomerDto(
                user.Id,
                user.FullName,
                user.PhoneNumber,
                user.Orders.Count,
                user.Orders.Select(order => (decimal?)order.Total).Sum() ?? 0m,
                user.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(ApiResponseFactory.Success(customers));
    }
}

public sealed record AdminCustomerDto(
    Guid Id,
    string FullName,
    string? PhoneNumber,
    int OrdersCount,
    decimal TotalSpent,
    DateTime CreatedAt);
