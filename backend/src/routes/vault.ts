import express from 'express';
import { Directory, Credential, ActivityLog } from '../models';
import { authenticateToken } from '../middleware/auth';
import { logActivity } from '../utils/activityLogger';

const router = express.Router();
router.use(authenticateToken);

router.get('/directories', async (req, res) => {
  try {
    const userId = req.user!._id;
    const directories = await Directory.find({ userId }).sort({ createdAt: -1 });
    res.json(directories);
  } catch (error) {
    console.error('Get directories error:', error);
    res.status(500).json({ error: 'Failed to fetch directories' });
  }
});

router.post('/directories', async (req, res) => {
  try {
    const userId = req.user!._id;
    const { name, description, icon } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Directory name is required' });
      return;
    }
    const directory = new Directory({ userId, name, description: description || '', icon: icon || '' });
    await directory.save();
    
    // Log activity
    await logActivity({
      userId,
      action: 'Directory Created',
      details: `Created directory "${name}"`,
      req,
      success: true
    });
    
    res.status(201).json(directory);
  } catch (error) {
    console.error('Create directory error:', error);
    res.status(500).json({ error: 'Failed to create directory' });
  }
});

router.get('/credentials', async (req, res) => {
  try {
    const userId = req.user!._id;
    const { directoryId } = req.query;
    const query: any = { userId };
    if (directoryId) query.directoryId = directoryId;
    const credentials = await Credential.find(query).sort({ createdAt: -1 });
    res.json(credentials);
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

router.post('/credentials', async (req, res) => {
  try {
    const userId = req.user!._id;
    const { directoryId, title, username, password, url, notes } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Credential title is required' });
      return;
    }
    const credential = new Credential({ 
      userId, 
      directoryId, 
      name: title, 
      username: username || '', 
      encryptedPassword: password || '', 
      url: url || '', 
      notes: notes || '' 
    });
    await credential.save();
    
    // Log activity
    await logActivity({
      userId,
      action: 'Credential Added',
      details: `Added credential "${title}"`,
      req,
      success: true
    });
    
    res.status(201).json(credential);
  } catch (error) {
    console.error('Create credential error:', error);
    res.status(500).json({ error: 'Failed to create credential' });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const userId = req.user!._id;
    const activities = await ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(50);
    res.json(activities);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Delete directory
router.delete('/directories/:id', async (req, res) => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const directory = await Directory.findOne({ _id: id, userId });
    if (!directory) {
      res.status(404).json({ error: 'Directory not found' });
      return;
    }

    const directoryName = directory.name;

    // Delete all credentials in this directory
    await Credential.deleteMany({ directoryId: id, userId });

    // Delete the directory
    await Directory.findByIdAndDelete(id);

    // Log activity
    await logActivity({
      userId,
      action: 'Directory Deleted',
      details: `Deleted directory "${directoryName}" and all its credentials`,
      req,
      success: true
    });

    res.json({ message: 'Directory deleted successfully' });
  } catch (error) {
    console.error('Delete directory error:', error);
    res.status(500).json({ error: 'Failed to delete directory' });
  }
});

// Delete credential
router.delete('/credentials/:id', async (req, res) => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const credential = await Credential.findOne({ _id: id, userId });
    if (!credential) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }

    const credentialName = credential.name;

    // Delete the credential
    await Credential.findByIdAndDelete(id);

    // Log activity
    await logActivity({
      userId,
      action: 'Credential Deleted',
      details: `Deleted credential "${credentialName}"`,
      req,
      success: true
    });

    res.json({ message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('Delete credential error:', error);
    res.status(500).json({ error: 'Failed to delete credential' });
  }
});

export default router;
