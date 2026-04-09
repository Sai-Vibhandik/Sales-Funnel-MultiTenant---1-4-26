# DoneForYou-AI Project

## Project Overview
A multi-tenant SaaS platform for managing creative workflows for marketing teams. Organizations can create projects, assign tasks to team members, and track the creative production process from strategy to deployment.

## Tech Stack

### Client
- React 18 + Vite
- TailwindCSS for styling
- React Router for navigation
- Recharts for data visualization
- Runs on port 5173 (development)

### Server
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Nodemailer for emails
- Runs on port 5000

### Key URLs
- Client: `http://localhost:5173` (set as `CLIENT_URL` in env)
- Server: `http://localhost:5000`

## Project Structure

```
DoneForYou-AI/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── dashboard/          # Role-specific dashboards
│       │   └── ...
│       ├── components/
│       ├── services/
│       └── context/
├── server/
│   └── src/
│       ├── controllers/
│       │   ├── taskController.js    # Task CRUD, reviews, assignments
│       │   ├── projectController.js # Project management
│       │   ├── authController.js    # Authentication
│       │   └── ...
│       ├── models/
│       │   ├── Task.js
│       │   ├── Project.js
│       │   ├── User.js
│       │   └── ...
│       ├── services/
│       │   ├── emailService.js      # Centralized email sending
│       │   └── taskGenerationService.js
│       ├── utils/
│       │   ├── sendEmail.js         # SMTP email utility
│       │   └── emailTemplates/      # Email templates
│       │       ├── taskAssignment.js
│       │       ├── orgRegistration.js
│       │       └── ...
│       ├── middleware/
│       │   └── tenant.js            # Multi-tenant context
│       └── constants/
│           └── taskStatuses.js      # Status constants
└── CLAUDE.md
```

## Multi-Tenancy

All data queries MUST filter by `organizationId`. The tenant middleware sets `req.organizationId` from:
1. `X-Organization-Id` header
2. `user.currentOrganization`
3. First active membership (fallback)

```javascript
// Always include organizationId in queries
const tasks = await Task.find({
  organizationId: req.organizationId,
  status: 'active'
});
```

## User Roles

| Role | Description |
|------|-------------|
| `platform_admin` | Full platform access, receives org registration emails |
| `admin` | Organization admin |
| `performance_marketer` | Creates strategies, provides final approval |
| `content_writer` | Creates content for creatives |
| `graphic_designer` | Creates image-based creatives |
| `video_editor` | Creates video content |
| `ui_ux_designer` | Designs landing pages |
| `developer` | Implements landing pages |
| `tester` | Reviews and approves/rejects work |

## Task Status Flow

### Creative Tasks (Image/Video)
```
content_pending → content_submitted → content_final_approved
    ↓                                    ↓
    (rejected)                      design_pending
                                         ↓
                                   design_submitted
                                         ↓
                                   design_approved → final_approved
                                    (rejected → design_rejected)
```

### Landing Page Tasks
```
design_pending → design_submitted → design_approved → development_pending
                                                        ↓
                                                  development_submitted
                                                        ↓
                                                  development_approved → final_approved
```

## Email Notification System

### Email Service Location
`server/src/services/emailService.js`

### Email Templates Location
`server/src/utils/emailTemplates/`

### Email Types

| Type | Template | Trigger |
|------|----------|---------|
| Organization Registration | `orgRegistration.js` | New org created after payment |
| Team Member Created | `teamMemberCreated.js` | Admin adds user to team |
| Task Assignment | `taskAssignment.js` | Task assigned to user |
| Rejection | `taskAssignment.js` (with rejectionContext) | Task rejected by tester/marketer |

### Email Flow by Role

1. **Performance Marketer completes strategy** → Email to assigned team members
2. **Content Planner submits content** → Email to Tester for review
3. **Tester approves content** → Email to Graphic Designer/Video Editor
4. **Tester rejects content** → Email to Content Planner with feedback
5. **Designer submits work** → Email to Tester for review
6. **Tester approves design** → Email to Performance Marketer for final approval
7. **Marketer approves design** → Email to Developer (for landing pages)
8. **Marketer rejects work** → Email to creator with feedback

### Email Template Logic (taskAssignment.js)

The template handles different scenarios based on:
- `assignedBy.name === 'System'` → System-generated email
- Task status determines email type:
  - `*_submitted` → Tester review email
  - `*_approved` → Marketer final approval email
  - `*_pending` → New task assignment email
  - With `rejectionContext` → Rejection email with feedback

### SMTP Configuration
Required environment variables:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@growthvalley.com
CLIENT_URL=http://localhost:5173
```

## Common Patterns

### API Route Protection
```javascript
router.use(protect);           // Auth middleware
router.use(setTenantContext);  // Set organization
router.use(requireOrganization); // Ensure org context
```

### Creating Notifications
```javascript
await Notification.create({
  recipient: userId,
  type: 'task_assigned',
  title: 'New Task',
  message: '...',
  projectId: project._id,
  organizationId: req.organizationId
});
```

### Sending Task Email
```javascript
// For rejections
const rejectionContext = {
  isRejection: true,
  rejectionReason: task.rejectionReason,
  rejectionNote: task.rejectionNote
};
emailService.sendTaskAssignmentNotification(
  task, project, assignedUser, { name: 'System' }, rejectionContext
);

// For assignments
emailService.sendTaskAssignmentNotification(
  task, project, assignedUser, { name: 'System' }
);
```

## Key Files Reference

| Feature | File |
|---------|------|
| Task Reviews | `server/src/controllers/taskController.js` |
| Email Templates | `server/src/utils/emailTemplates/taskAssignment.js` |
| Dashboard Components | `client/src/pages/dashboard/*Dashboard.jsx` |
| Task Creation | `server/src/services/taskGenerationService.js` |
| Multi-Tenant Middleware | `server/src/middleware/tenant.js` |
| Task Status Constants | `server/src/constants/taskStatuses.js` |

## Recent Work (April 2026)

### Email Notification System Implementation
- Created centralized email service
- Built email templates for all notification types
- Integrated emails with task workflow
- Fixed task descriptions for designer/developer emails
- Added rejection email with feedback display
- Added marketer final approval email

### Dashboard Fixes
- Fixed empty state display for Content Writer dashboard
- Fixed empty state display for Video Editor dashboard
- Fixed TesterDashboard recently reviewed card click handlers

### Schema Fixes
- Made `subType` not required in creativePlanItemSchema
- Added empty string to enums for `objective`, `assignedRole`, `aiFramework`

## Debugging Tips

1. **Emails not sending**: Check SMTP env vars, check console for error logs
2. **Task not found**: Ensure organizationId filter is applied
3. **Wrong user getting email**: Check `task.assignedTo` vs `task.marketerId` vs populated fields
4. **Status not updating**: Check valid status transitions in `taskStatuses.js`

## Payment Integration Notes
- Razorpay integration for subscriptions
- Webhooks handle subscription updates
- Need `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`