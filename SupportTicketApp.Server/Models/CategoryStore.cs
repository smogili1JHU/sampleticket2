namespace SupportTicketApp.Server.Models
{
    public static  class CategoryStore
    {
        public static readonly IReadOnlyList<TicketCategory> All = new List<TicketCategory>
    {
        new(1, "Bug"),
        new(2, "Feature Request"),
        new(3, "Billing"),
        new(4, "Account Access"),
        new(5, "Other")
    };
    }
}
