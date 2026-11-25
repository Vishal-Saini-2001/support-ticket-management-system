const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Comment = require('../src/models/Comment');
const ActivityLog = require('../src/models/ActivityLog');
const Notification = require('../src/models/Notification');

const waitForAsyncEvents = () => new Promise((resolve) => setTimeout(resolve, 100));

async function createUserAndToken({ name, email, password = 'Password123!', role = 'user' }) {
  if (role === 'admin') {
    await User.create({ name, email, password, role: 'admin' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    return { token: loginRes.body.token, user: loginRes.body.user };
  }

  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  return { token: res.body.token, user: res.body.user };
}

describe('Tickets Access Control, Workflows & Events', () => {
  it('enforces ownership on view, edit, delete, comments, and activity', async () => {
    const owner = await createUserAndToken({ name: 'User One', email: 'u1@example.com' });
    const other = await createUserAndToken({ name: 'User Two', email: 'u2@example.com' });

    const createRes = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Login button unresponsive',
        description: 'Clicking login on Safari does nothing.',
        category: 'technical',
        priority: 'high',
      });

    expect(createRes.status).toBe(201);
    const ticketId = createRes.body.data._id;

    // Owner can view & edit while open
    const getOwn = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(getOwn.status).toBe(200);

    const updateOwn = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Login button unresponsive on Safari 18' });
    expect(updateOwn.status).toBe(200);
    expect(updateOwn.body.data.title).toBe('Login button unresponsive on Safari 18');

    // Other user is forbidden on all ticket sub-resources
    const otherGet = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(otherGet.status).toBe(403);

    const otherPut = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ title: 'Hijacked title' });
    expect(otherPut.status).toBe(403);

    const otherDelete = await request(app)
      .delete(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(otherDelete.status).toBe(403);

    const otherComment = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ message: 'Intruder comment' });
    expect(otherComment.status).toBe(403);

    const otherActivity = await request(app)
      .get(`/api/tickets/${ticketId}/activity`)
      .set('Authorization', `Bearer ${other.token}`);
    expect(otherActivity.status).toBe(403);

    // Other user sees empty list for their own tickets
    const otherList = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${other.token}`);
    expect(otherList.status).toBe(200);
    expect(otherList.body).toMatchObject({ data: [], total: 0, page: 1, pages: 0 });
  });

  it('prevents regular users from editing/deleting non-open tickets or changing status/priority', async () => {
    const owner = await createUserAndToken({ name: 'Owner', email: 'owner@example.com' });
    const admin = await createUserAndToken({
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin',
    });

    const createRes = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Billing charge twice',
        description: 'Charged twice for monthly plan.',
        category: 'billing',
      });
    const ticketId = createRes.body.data._id;

    // Regular user cannot call admin-only status/priority endpoints
    const userStatus = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'in-progress' });
    expect(userStatus.status).toBe(403);

    const userPriority = await request(app)
      .patch(`/api/tickets/${ticketId}/priority`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ priority: 'urgent' });
    expect(userPriority.status).toBe(403);

    // Admin moves ticket to in-progress
    const adminStatus = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'in-progress' });
    expect(adminStatus.status).toBe(200);
    expect(adminStatus.body.data.status).toBe('in-progress');

    // Owner can no longer edit or delete when not open
    const editClosed = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Edited after in-progress' });
    expect(editClosed.status).toBe(403);

    const deleteClosed = await request(app)
      .delete(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(deleteClosed.status).toBe(403);
  });

  it('cascades comment deletion when owner deletes an open ticket', async () => {
    const owner = await createUserAndToken({ name: 'Owner', email: 'del@example.com' });

    const createRes = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Delete me ticket',
        description: 'Will be deleted with its comments.',
        category: 'general',
      });
    const ticketId = createRes.body.data._id;

    await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ message: 'First comment' });

    expect(await Comment.countDocuments({ ticket: ticketId })).toBe(1);

    const delRes = await request(app)
      .delete(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(delRes.status).toBe(200);
    expect(await Comment.countDocuments({ ticket: ticketId })).toBe(0);
  });

  it('records ActivityLogs, Notifications, resolvedAt, and stats across user and admin actions', async () => {
    const owner = await createUserAndToken({ name: 'Jane User', email: 'jane@example.com' });
    const admin = await createUserAndToken({
      name: 'Support Admin',
      email: 'support-admin@example.com',
      role: 'admin',
    });

    const createRes = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Database timeout in reports',
        description: 'Report export times out after 30 seconds.',
        category: 'technical',
        priority: 'urgent',
      });
    const ticketId = createRes.body.data._id;

    // Admin resolves ticket and adds a comment
    const resolveRes = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'resolved' });
    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('resolved');
    expect(resolveRes.body.data.resolvedAt).toBeTruthy();

    const adminCommentRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ message: 'Query index added and timeout fixed.' });
    expect(adminCommentRes.status).toBe(201);

    await waitForAsyncEvents();

    // Activity logs exist for creation, status change, resolution, and comment
    const logs = await ActivityLog.find({ ticket: ticketId });
    const actions = logs.map((l) => l.action);
    expect(actions).toEqual(
      expect.arrayContaining([
        'TICKET_CREATED',
        'STATUS_CHANGED',
        'TICKET_RESOLVED',
        'COMMENT_ADDED',
      ])
    );

    // Admin notified of new ticket; user notified of status change & admin comment
    const adminNotifs = await Notification.find({ recipient: admin.user._id });
    expect(adminNotifs.length).toBeGreaterThanOrEqual(1);

    const userNotifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(userNotifRes.status).toBe(200);
    expect(userNotifRes.body.data.length).toBeGreaterThanOrEqual(2);

    const notifId = userNotifRes.body.data[0]._id;
    const readRes = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${owner.token}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.isRead).toBe(true);

    // Search & stats check (partial character-by-character match)
    const searchRes = await request(app)
      .get('/api/tickets?search=timeo&status=resolved')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.total).toBe(1);

    const statsRes = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.total).toBe(1);
    expect(statsRes.body.byStatus.resolved).toBe(1);
    expect(statsRes.body.byPriority.urgent).toBe(1);
  });
});

