using System.ComponentModel.DataAnnotations;

namespace SupportTicketApp.Server.Models
{
    public class CreateTicketRequest
    {
        [Required, StringLength(100)]
        public string Name { get; set; } = "";

        [Required, EmailAddress, StringLength(200)]
        public string Email { get; set; } = "";

        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }

        [Required, RegularExpression("Low|Medium|High")]
        public string Priority { get; set; } = "Medium";

        [Required, StringLength(500)]
        public string Description { get; set; } = "";

        public DateOnly? DueDate { get; set; }
    }
}
