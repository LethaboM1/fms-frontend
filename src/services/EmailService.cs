using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace FMS.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken)
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            
            var smtpClient = new SmtpClient(emailSettings["SmtpServer"])
            {
                Port = int.Parse(emailSettings["SmtpPort"]),
                Credentials = new NetworkCredential(emailSettings["Username"], emailSettings["Password"]),
                EnableSsl = true,
            };

            var resetLink = $"{_configuration["App:BaseUrl"]}/reset-password?token={resetToken}";
            
            var mailMessage = new MailMessage
            {
                From = new MailAddress(emailSettings["Username"], "FMS System"),
                Subject = "Password Reset Request - Fuel Management System",
                Body = GenerateResetEmailBody(userName, resetLink, resetToken),
                IsBodyHtml = true,
            };

            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
        }

        private string GenerateResetEmailBody(string userName, string resetLink, string resetToken)
        {
            return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }}
                    .content {{ background: #f9f9f9; padding: 20px; }}
                    .button {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }}
                    .token {{ background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>Fuel Management System</h1>
                    </div>
                    <div class='content'>
                        <h2>Password Reset Request</h2>
                        <p>Hi {userName},</p>
                        <p>You requested to reset your password for the Fuel Management System.</p>
                        
                        <p><strong>Click the button below to reset your password:</strong></p>
                        <p>
                            <a href='{resetLink}' class='button'>Reset Password</a>
                        </p>
                        
                        <p>Or copy and paste this token in the reset password page:</p>
                        <div class='token'>{resetToken}</div>
                        
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        
                        <p>If you didn't request this reset, please ignore this email.</p>
                        
                        <p>Best regards,<br>FMS Team</p>
                    </div>
                </div>
            </body>
            </html>";
        }
    }
}