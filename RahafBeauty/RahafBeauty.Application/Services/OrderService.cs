using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.Services;

public sealed class OrderService : ServiceBase, IOrderService
{
    private readonly IOrderNumberGenerator _orderNumberGenerator;

    public OrderService(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IOrderNumberGenerator orderNumberGenerator)
        : base(db, currentUser)
    {
        _orderNumberGenerator = orderNumberGenerator;
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var cart = await Db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Brand)
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Category)
            .Include(c => c.Items).ThenInclude(i => i.ProductSize)
            .Include(c => c.Items).ThenInclude(i => i.ProductColor)
            .Include(c => c.Items).ThenInclude(i => i.ProductVariant)
            .FirstOrDefaultAsync(c => c.UserId == user.Id, cancellationToken)
            ?? throw new AppValidationException("السلة فارغة", new Dictionary<string, string[]> { ["cart"] = ["السلة فارغة"] });

        if (cart.Items.Count == 0)
        {
            throw new AppValidationException("السلة فارغة", new Dictionary<string, string[]> { ["cart"] = ["السلة فارغة"] });
        }

        var address = request.AddressId.HasValue
            ? await Db.CustomerAddresses.AsNoTracking().FirstOrDefaultAsync(a => a.Id == request.AddressId.Value && a.UserId == user.Id, cancellationToken)
                ?? throw new KeyNotFoundException("العنوان غير موجود")
            : null;

        var customerName = string.IsNullOrWhiteSpace(request.CustomerName) ? user.FullName : request.CustomerName.Trim();
        var customerPhone = string.IsNullOrWhiteSpace(request.Phone) ? user.PhoneNumber : request.Phone.Trim();
        var city = address?.City ?? request.City?.Trim();
        var area = address?.Area ?? request.Area?.Trim();
        var street = address?.Street ?? request.Street?.Trim();
        var building = address?.Building ?? request.Building?.Trim();
        var notes = address?.Notes ?? request.Notes?.Trim();

        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.CustomerName), customerName, "اسم العميل مطلوب");
        ValidationHelper.Phone(fields, nameof(request.Phone), customerPhone);
        ValidationHelper.Required(fields, nameof(request.City), city, "المدينة مطلوبة");
        ValidationHelper.Required(fields, nameof(request.Area), area, "المنطقة مطلوبة");
        ValidationHelper.Required(fields, nameof(request.Street), street, "الشارع مطلوب");
        ValidationHelper.ThrowIfInvalid(fields);

        foreach (var item in cart.Items)
        {
            if (!item.Product.IsActive)
            {
                throw new AppValidationException("يوجد منتج غير متاح في السلة", new Dictionary<string, string[]>
                {
                    ["cart"] = [$"المنتج {item.Product.Name} غير متاح"]
                });
            }
        }

        var subtotal = cart.Items.Sum(i => i.UnitPrice * i.Quantity);
        var total = cart.Items.Sum(i => i.FinalUnitPrice * i.Quantity);
        var order = new Order
        {
            OrderNumber = await _orderNumberGenerator.GenerateAsync(cancellationToken),
            UserId = user.Id,
            CustomerNameSnapshot = customerName!,
            CustomerPhoneSnapshot = customerPhone,
            CustomerEmailSnapshot = user.Email,
            City = city!,
            Area = area!,
            Street = street!,
            Building = building,
            Notes = notes,
            Subtotal = subtotal,
            DiscountTotal = subtotal - total,
            DeliveryFee = 0,
            Total = total,
            PaymentMethod = PaymentMethod.CashOnDelivery,
            PaymentStatus = PaymentStatus.PendingOnDelivery,
            Status = OrderStatus.UnderReview
        };

        foreach (var item in cart.Items)
        {
            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductNameSnapshot = item.Product.Name,
                BrandNameSnapshot = item.Product.Brand.Name,
                CategoryNameSnapshot = item.Product.Category.Name,
                ProductSizeLabelSnapshot = item.ProductSize?.Label,
                ProductColorNameSnapshot = item.ProductColor?.Name,
                ProductColorHexSnapshot = item.ProductColor?.HexCode,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                DiscountPercent = item.DiscountPercent,
                FinalUnitPrice = item.FinalUnitPrice,
                LineTotal = item.FinalUnitPrice * item.Quantity
            });
        }

        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = OrderStatus.UnderReview,
            ChangedByUserId = user.Id,
            Note = "تم إنشاء الطلب"
        });

        order.AdminNotifications.Add(new AdminNotification
        {
            Type = NotificationType.NewOrder,
            Title = "طلب جديد",
            Message = $"تم إنشاء الطلب {order.OrderNumber}",
            IsRead = false
        });

        Db.Orders.Add(order);
        Db.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await Db.SaveChangesAsync(cancellationToken);
        return await GetMyOrderAsync(order.Id, cancellationToken);
    }

    public async Task<IReadOnlyList<OrderSummaryDto>> GetMyOrdersAsync(CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        return await Db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.OrderNumber,
                o.CustomerNameSnapshot,
                o.CustomerPhoneSnapshot,
                o.Total,
                o.PaymentMethod,
                o.PaymentStatus,
                o.Status,
                o.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<OrderDto> GetMyOrderAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        var order = await OrderDetailsQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("الطلب غير موجود");

        return MapOrder(order);
    }

    public async Task<PagedResult<OrderSummaryDto>> GetAdminOrdersAsync(AdminOrderQuery query, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var orders = Db.Orders.AsNoTracking().AsQueryable();

        if (query.Status.HasValue)
        {
            orders = orders.Where(o => o.Status == query.Status.Value);
        }

        if (query.From.HasValue)
        {
            orders = orders.Where(o => o.CreatedAt >= query.From.Value);
        }

        if (query.To.HasValue)
        {
            orders = orders.Where(o => o.CreatedAt <= query.To.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            orders = orders.Where(o =>
                o.OrderNumber.Contains(term) ||
                o.CustomerNameSnapshot.Contains(term) ||
                (o.CustomerPhoneSnapshot != null && o.CustomerPhoneSnapshot.Contains(term)));
        }

        var total = await orders.CountAsync(cancellationToken);
        var items = await orders
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.OrderNumber,
                o.CustomerNameSnapshot,
                o.CustomerPhoneSnapshot,
                o.Total,
                o.PaymentMethod,
                o.PaymentStatus,
                o.Status,
                o.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<OrderSummaryDto>(items, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<OrderDto> GetAdminOrderAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await OrderDetailsQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("الطلب غير موجود");

        return MapOrder(order);
    }

    public async Task<OrderDto> ApproveAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await Db.Orders.Include(o => o.StatusHistory).FirstOrDefaultAsync(o => o.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("الطلب غير موجود");

        if (order.Status != OrderStatus.UnderReview)
        {
            throw new AppValidationException("يمكن اعتماد الطلبات قيد المراجعة فقط", new Dictionary<string, string[]>
            {
                ["status"] = ["يمكن اعتماد الطلبات قيد المراجعة فقط"]
            });
        }

        AppendStatus(order, OrderStatus.Approved, "تم اعتماد الطلب");
        await Db.SaveChangesAsync(cancellationToken);
        return await GetAdminOrderAsync(id, cancellationToken);
    }

    public async Task<OrderDto> RejectAsync(Guid id, RejectOrderRequest request, CancellationToken cancellationToken = default)
    {
        var order = await Db.Orders.Include(o => o.StatusHistory).FirstOrDefaultAsync(o => o.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("الطلب غير موجود");

        if (order.Status != OrderStatus.UnderReview)
        {
            throw new AppValidationException("يمكن رفض الطلبات قيد المراجعة فقط", new Dictionary<string, string[]>
            {
                ["status"] = ["يمكن رفض الطلبات قيد المراجعة فقط"]
            });
        }

        AppendStatus(order, OrderStatus.Rejected, request.Note);
        await Db.SaveChangesAsync(cancellationToken);
        return await GetAdminOrderAsync(id, cancellationToken);
    }

    public async Task<OrderDto> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest request, CancellationToken cancellationToken = default)
    {
        var order = await Db.Orders.Include(o => o.StatusHistory).FirstOrDefaultAsync(o => o.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("الطلب غير موجود");

        if (order.Status == request.Status)
        {
            var message = $"حالة الطلب محددة بالفعل: {GetStatusLabel(order.Status)}";
            throw new AppValidationException(message, new Dictionary<string, string[]>
            {
                [nameof(request.Status)] = [message]
            });
        }

        if (!IsAllowedTransition(order.Status, request.Status))
        {
            throw BuildStatusTransitionException(order.Status, request.Status);
        }

        AppendStatus(order, request.Status, request.Note);
        if (request.Status == OrderStatus.Received)
        {
            order.PaymentStatus = PaymentStatus.PaidOnDelivery;
        }

        await Db.SaveChangesAsync(cancellationToken);
        return await GetAdminOrderAsync(id, cancellationToken);
    }

    private IQueryable<Order> OrderDetailsQuery() =>
        Db.Orders
            .Include(o => o.Items)
            .Include(o => o.StatusHistory);

    private void AppendStatus(Order order, OrderStatus status, string? note)
    {
        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        Db.OrderStatusHistory.Add(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = status,
            ChangedByUserId = CurrentUser.UserId,
            Note = note,
            ChangedAt = DateTime.UtcNow
        });
    }

    private static bool IsAllowedTransition(OrderStatus current, OrderStatus next) =>
        current switch
        {
            OrderStatus.UnderReview => next is OrderStatus.Approved or OrderStatus.Cancelled,
            OrderStatus.Approved => next is OrderStatus.Preparing or OrderStatus.Shipping or OrderStatus.OutForDelivery or OrderStatus.Cancelled,
            OrderStatus.Preparing => next is OrderStatus.Shipping or OrderStatus.OutForDelivery or OrderStatus.Cancelled,
            OrderStatus.Shipping => next is OrderStatus.OutForDelivery or OrderStatus.Received,
            OrderStatus.OutForDelivery => next is OrderStatus.Received,
            _ => false
        };

    private static AppValidationException BuildStatusTransitionException(OrderStatus current, OrderStatus next)
    {
        var message = IsTerminalStatus(current)
            ? $"لا يمكن تغيير حالة الطلب بعد وصولها إلى {GetStatusLabel(current)}"
            : $"لا يمكن نقل الطلب من {GetStatusLabel(current)} إلى {GetStatusLabel(next)}";

        return new AppValidationException(message, new Dictionary<string, string[]>
        {
            [nameof(UpdateOrderStatusRequest.Status)] = [message]
        });
    }

    private static bool IsTerminalStatus(OrderStatus status) =>
        status is OrderStatus.Received or OrderStatus.Cancelled or OrderStatus.Rejected;

    private static string GetStatusLabel(OrderStatus status) =>
        status switch
        {
            OrderStatus.UnderReview => "قيد المراجعة",
            OrderStatus.Approved => "مقبول",
            OrderStatus.Rejected => "مرفوض",
            OrderStatus.Preparing => "قيد التجهيز",
            OrderStatus.Shipping => "تم تحميل البضاعة",
            OrderStatus.OutForDelivery => "تم شحن الطلب",
            OrderStatus.Received => "تم تسليم الطلب",
            OrderStatus.Cancelled => "ملغي",
            _ => "غير معروفة"
        };

    private static OrderDto MapOrder(Order order) =>
        new(
            order.Id,
            order.OrderNumber,
            order.UserId,
            order.CustomerDeleted,
            order.CustomerNameSnapshot,
            order.CustomerPhoneSnapshot,
            order.City,
            order.Area,
            order.Street,
            order.Building,
            order.Notes,
            order.Subtotal,
            order.DiscountTotal,
            order.DeliveryFee,
            order.Total,
            order.PaymentMethod,
            order.PaymentStatus,
            order.Status,
            order.CreatedAt,
            order.Items.OrderBy(i => i.CreatedAt).Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductNameSnapshot,
                i.BrandNameSnapshot,
                i.CategoryNameSnapshot,
                i.ProductSizeLabelSnapshot,
                i.ProductColorNameSnapshot,
                i.ProductColorHexSnapshot,
                i.Quantity,
                i.UnitPrice,
                i.DiscountPercent,
                i.FinalUnitPrice,
                i.LineTotal)).ToList(),
            order.StatusHistory.OrderBy(h => h.ChangedAt).Select(h => new OrderStatusHistoryDto(
                h.Id,
                h.Status,
                h.ChangedByUserId,
                h.ChangedAt,
                h.Note)).ToList());
}
