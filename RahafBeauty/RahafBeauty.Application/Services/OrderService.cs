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
    private readonly IDiscountResolver _discountResolver;
    private readonly IOrderNumberGenerator _orderNumberGenerator;
    private readonly IPriceResolver _priceResolver;

    public OrderService(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IDiscountResolver discountResolver,
        IOrderNumberGenerator orderNumberGenerator,
        IPriceResolver priceResolver)
        : base(db, currentUser)
    {
        _discountResolver = discountResolver;
        _orderNumberGenerator = orderNumberGenerator;
        _priceResolver = priceResolver;
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
                BrandNameSnapshot = item.Product.BrandName ?? item.Product.Brand?.Name,
                CategoryNameSnapshot = item.Product.Category.Name,
                ProductSizeId = item.ProductSizeId,
                ProductSizeLabelSnapshot = item.ProductSize?.Label,
                ProductColorId = item.ProductColorId,
                ProductColorNameSnapshot = item.ProductColor?.Name,
                ProductColorHexSnapshot = item.ProductColor?.HexCode,
                ProductVariantId = item.ProductVariantId,
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

    public async Task<ReorderResultDto> ReorderAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var order = await Db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == user.Id, cancellationToken)
            ?? throw new KeyNotFoundException("الطلب غير موجود");

        if (order.Items.Count == 0)
        {
            throw new AppValidationException("لا توجد منتجات لإعادة الطلب", new Dictionary<string, string[]>
            {
                ["order"] = ["لا توجد منتجات لإعادة الطلب"]
            });
        }

        var cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        var warnings = new List<string>();
        var addedItems = 0;

        foreach (var orderItem in order.Items.OrderBy(item => item.CreatedAt))
        {
            if (!orderItem.ProductId.HasValue)
            {
                warnings.Add($"تعذر إضافة {orderItem.ProductNameSnapshot}: المنتج لم يعد متاحا.");
                continue;
            }

            var product = await LoadProductForReorderAsync(orderItem.ProductId.Value, cancellationToken);
            if (product is null)
            {
                warnings.Add($"تعذر إضافة {orderItem.ProductNameSnapshot}: المنتج لم يعد متاحا.");
                continue;
            }

            if (!TryResolveReorderSelection(product, orderItem, warnings, out var selection))
            {
                continue;
            }

            await AddOrMergeCartItemAsync(cart, product, selection, orderItem.Quantity, cancellationToken);
            addedItems++;
        }

        if (addedItems == 0)
        {
            var message = warnings.Count > 0
                ? "تعذر إعادة الطلب لأن المنتجات أو الخيارات لم تعد متاحة."
                : "تعذر إعادة الطلب.";

            throw new AppValidationException(message, new Dictionary<string, string[]>
            {
                ["order"] = warnings.Count > 0 ? warnings.ToArray() : [message]
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await Db.SaveChangesAsync(cancellationToken);
        cart = await GetOrCreateCartAsync(user.Id, cancellationToken);
        return new ReorderResultDto(MapCart(cart), warnings);
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

    private async Task<Cart> GetOrCreateCartAsync(Guid userId, CancellationToken cancellationToken)
    {
        var cart = await Db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Include(c => c.Items).ThenInclude(i => i.ProductSize)
            .Include(c => c.Items).ThenInclude(i => i.ProductColor)
            .Include(c => c.Items).ThenInclude(i => i.ProductVariant)
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

        if (cart is not null)
        {
            return cart;
        }

        cart = new Cart { UserId = userId };
        Db.Carts.Add(cart);
        await Db.SaveChangesAsync(cancellationToken);
        return cart;
    }

    private async Task<Product?> LoadProductForReorderAsync(Guid productId, CancellationToken cancellationToken)
    {
        return await Db.Products
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(
                p => p.Id == productId && p.IsActive && p.Category.IsActive && (p.Brand == null || p.Brand.IsActive),
                cancellationToken);
    }

    private static bool TryResolveReorderSelection(
        Product product,
        OrderItem orderItem,
        List<string> warnings,
        out ProductSelection selection)
    {
        selection = new ProductSelection(null, null, null);
        var productName = orderItem.ProductNameSnapshot;

        ProductSize? size = null;
        if (product.Sizes.Count > 0)
        {
            size = ResolveSize(product, orderItem);
            if (size is null)
            {
                warnings.Add($"تعذر إضافة {productName}: الحجم السابق لم يعد متاحا.");
                return false;
            }
        }

        ProductColor? color = null;
        if (product.Colors.Count > 0)
        {
            color = ResolveColor(product, orderItem);
            if (color is null)
            {
                warnings.Add($"تعذر إضافة {productName}: اللون السابق لم يعد متاحا.");
                return false;
            }
        }

        var variant = ResolveVariant(product, size?.Id, color?.Id, orderItem.ProductVariantId);
        if (product.Variants.Count > 0 && variant is null)
        {
            warnings.Add($"تعذر إضافة {productName}: خيار المنتج السابق لم يعد متاحا.");
            return false;
        }

        selection = new ProductSelection(size, color, variant);
        return true;
    }

    private static ProductSize? ResolveSize(Product product, OrderItem orderItem)
    {
        if (orderItem.ProductSizeId.HasValue)
        {
            var byId = product.Sizes.FirstOrDefault(size => size.Id == orderItem.ProductSizeId.Value);
            if (byId is not null)
            {
                return byId;
            }
        }

        return string.IsNullOrWhiteSpace(orderItem.ProductSizeLabelSnapshot)
            ? null
            : product.Sizes.FirstOrDefault(size => string.Equals(
                size.Label.Trim(),
                orderItem.ProductSizeLabelSnapshot.Trim(),
                StringComparison.OrdinalIgnoreCase));
    }

    private static ProductColor? ResolveColor(Product product, OrderItem orderItem)
    {
        if (orderItem.ProductColorId.HasValue)
        {
            var byId = product.Colors.FirstOrDefault(color => color.Id == orderItem.ProductColorId.Value);
            if (byId is not null)
            {
                return byId;
            }
        }

        return string.IsNullOrWhiteSpace(orderItem.ProductColorNameSnapshot)
            ? null
            : product.Colors.FirstOrDefault(color =>
                string.Equals(color.Name.Trim(), orderItem.ProductColorNameSnapshot.Trim(), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(color.HexCode.Trim(), orderItem.ProductColorHexSnapshot?.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    private static ProductVariant? ResolveVariant(Product product, Guid? sizeId, Guid? colorId, Guid? variantId)
    {
        if (product.Variants.Count == 0)
        {
            return null;
        }

        if (variantId.HasValue)
        {
            var byId = product.Variants.FirstOrDefault(variant => variant.Id == variantId.Value);
            if (byId is not null &&
                (!byId.ProductSizeId.HasValue || byId.ProductSizeId == sizeId) &&
                (!byId.ProductColorId.HasValue || byId.ProductColorId == colorId))
            {
                return byId;
            }
        }

        return product.Variants.FirstOrDefault(variant =>
            variant.ProductSizeId == sizeId &&
            variant.ProductColorId == colorId);
    }

    private async Task AddOrMergeCartItemAsync(
        Cart cart,
        Product product,
        ProductSelection selection,
        int quantity,
        CancellationToken cancellationToken)
    {
        var safeQuantity = Math.Max(quantity, 1);
        var discount = await _discountResolver.ResolveAsync(product.Id, product.BrandId, DateTime.UtcNow, cancellationToken);
        var unitPrice = _priceResolver.ResolveUnitPrice(new ProductPriceContext(product.BasePrice, selection.Size?.Price, selection.Variant?.Price));
        var finalUnitPrice = ApplyDiscount(unitPrice, discount.Percentage);

        var existing = cart.Items.FirstOrDefault(item =>
            item.ProductId == product.Id &&
            item.ProductSizeId == selection.Size?.Id &&
            item.ProductColorId == selection.Color?.Id &&
            item.ProductVariantId == selection.Variant?.Id);

        if (existing is not null)
        {
            existing.Quantity += safeQuantity;
            existing.UnitPrice = unitPrice;
            existing.DiscountPercent = discount.Percentage;
            existing.FinalUnitPrice = finalUnitPrice;
            existing.UpdatedAt = DateTime.UtcNow;
            return;
        }

        cart.Items.Add(new CartItem
        {
            CartId = cart.Id,
            ProductId = product.Id,
            ProductSizeId = selection.Size?.Id,
            ProductColorId = selection.Color?.Id,
            ProductVariantId = selection.Variant?.Id,
            Quantity = safeQuantity,
            UnitPrice = unitPrice,
            DiscountPercent = discount.Percentage,
            FinalUnitPrice = finalUnitPrice
        });
    }

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
                i.ProductSizeId,
                i.ProductSizeLabelSnapshot,
                i.ProductColorId,
                i.ProductColorNameSnapshot,
                i.ProductColorHexSnapshot,
                i.ProductVariantId,
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

    private static CartDto MapCart(Cart cart)
    {
        var items = cart.Items
            .OrderBy(i => i.CreatedAt)
            .Select(i =>
            {
                var lineTotal = i.FinalUnitPrice * i.Quantity;
                return new CartItemDto(
                    i.Id,
                    i.ProductId,
                    i.Product.Name,
                    i.Product.Images.OrderBy(img => img.SortOrder).FirstOrDefault()?.ImageUrl,
                    i.ProductSizeId,
                    i.ProductSize?.Label,
                    i.ProductColorId,
                    i.ProductColor?.Name,
                    i.ProductColor?.HexCode,
                    i.ProductVariantId,
                    i.Quantity,
                    i.UnitPrice,
                    i.DiscountPercent,
                    i.FinalUnitPrice,
                    lineTotal);
            })
            .ToList();

        var subtotal = items.Sum(i => i.UnitPrice * i.Quantity);
        var total = items.Sum(i => i.LineTotal);
        return new CartDto(cart.Id, items, subtotal, subtotal - total, total);
    }

    private static decimal ApplyDiscount(decimal price, decimal? percentage) =>
        percentage.HasValue ? Math.Round(price - (price * percentage.Value / 100m), 2) : price;

    private sealed record ProductSelection(ProductSize? Size, ProductColor? Color, ProductVariant? Variant);
}
