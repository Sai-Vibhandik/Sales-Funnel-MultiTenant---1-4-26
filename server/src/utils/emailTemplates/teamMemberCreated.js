const baseTemplate = require('./baseTemplate');

/**
 * Team Member Created Email Template
 * Sent when an admin creates a new team member account directly
 */

const teamMemberCreatedTemplate = (user, organization, createdBy, temporaryPassword = null) => {
  const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;

  // Format role for display
  const formatRole = (role) => {
    const roleMap = {
      admin: 'Administrator',
      performance_marketer: 'Performance Marketer',
      graphic_designer: 'Graphic Designer',
      video_editor: 'Video Editor',
      ui_ux_designer: 'UI/UX Designer',
      developer: 'Developer',
      tester: 'QA Tester',
      content_writer: 'Content Writer',
      content_creator: 'Content Creator'
    };
    return roleMap[role] || role;
  };

  const content = `
    <h2>Welcome to ${organization?.name || 'Growth Valley'}!</h2>
    <p>Hi ${user.name},</p>
    <p><strong>${createdBy.name}</strong> has created an account for you on Growth Valley.</p>

    <div class="details">
      <div class="details-item">
        <span class="details-label">Organization:</span>
        <span class="details-value">${organization?.name || 'N/A'}</span>
      </div>
      <div class="details-item">
        <span class="details-label">Your Role:</span>
        <span class="details-value">${formatRole(user.role)}</span>
      </div>
      <div class="details-item">
        <span class="details-label">Email:</span>
        <span class="details-value">${user.email}</span>
      </div>
      ${temporaryPassword ? `
      <div class="details-item">
        <span class="details-label">Temporary Password:</span>
        <span class="details-value" style="font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${temporaryPassword}</span>
      </div>
      ` : ''}
    </div>

    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Login to Your Account</a>
    </p>

    ${temporaryPassword ? `
    <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
      <strong>Important:</strong> Please change your password after logging in for the first time.
    </p>
    ` : ''}

    <p style="font-size: 14px; color: #64748b;">
      If you have any questions, please contact your administrator.
    </p>
  `;

  return {
    subject: `Welcome to ${organization?.name || 'Growth Valley'} - Your Account is Ready`,
    html: baseTemplate(content, { title: 'Growth Valley' })
  };
};

module.exports = teamMemberCreatedTemplate;