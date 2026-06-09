using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class AnnouncementSettings : AuditableEntity
{
    public bool IsEnabled { get; set; } = true;

    public string Text { get; set; } = string.Empty;

    public string BackgroundColor { get; set; } = "#000000";

    public string TextColor { get; set; } = "#FFFFFF";

    public string? LinkText { get; set; }

    public string? LinkUrl { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}