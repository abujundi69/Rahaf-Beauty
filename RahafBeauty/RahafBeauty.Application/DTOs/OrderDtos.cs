using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.DTOs;

public sealed record CreateOrderRequest(
    Guid? AddressId,
    string? CustomerName,
    string? Phone,
    string? City,
    string? Area,
    string? Street,
    string? Building,
    string? Notes);

public sealed record AdminOrderQuery(
    OrderStatus? Status = null,
    DateTime? From = null,
    DateTime? To = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20);

public sealed record RejectOrderRequest(string? Note);

public sealed record UpdateOrderStatusRequest(OrderStatus Status, string? Note);

public sealed record OrderSummaryDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    string? CustomerPhone,
    decimal Total,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    OrderStatus Status,
    DateTime CreatedAt);

public sealed record OrderDto(
    Guid Id,
    string OrderNumber,
    Guid? UserId,
    bool CustomerDeleted,
    string CustomerName,
    string? CustomerPhone,
    string City,
    string Area,
    string Street,
    string? Building,
    string? Notes,
    decimal Subtotal,
    decimal DiscountTotal,
    decimal DeliveryFee,
    decimal Total,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    OrderStatus Status,
    DateTime CreatedAt,
    IReadOnlyList<OrderItemDto> Items,
    IReadOnlyList<OrderStatusHistoryDto> StatusHistory);

public sealed record ReorderResultDto(
    CartDto Cart,
    IReadOnlyList<string> Warnings);

public sealed record OrderItemDto(
    Guid Id,
    Guid? ProductId,
    string ProductName,
    string? BrandName,
    string? CategoryName,
    Guid? ProductSizeId,
    string? SizeLabel,
    Guid? ProductColorId,
    string? ColorName,
    string? ColorHex,
    Guid? ProductVariantId,
    int Quantity,
    decimal UnitPrice,
    decimal? DiscountPercent,
    decimal FinalUnitPrice,
    decimal LineTotal);

public sealed record OrderStatusHistoryDto(
    Guid Id,
    OrderStatus Status,
    Guid? ChangedByUserId,
    DateTime ChangedAt,
    string? Note);
