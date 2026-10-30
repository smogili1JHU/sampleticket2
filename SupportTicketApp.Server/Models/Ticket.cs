namespace SupportTicketApp.Server.Models
{ 
    public record Ticket(
    int Id,
    string Name,
    string Email,
    int CategoryId,
    string CategoryName,
    string Priority,
    string Description,
    DateOnly? DueDate,
    DateTimeOffset CreatedAt);
}
