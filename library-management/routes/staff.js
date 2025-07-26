const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // Your DB connection module

// Get all staff with optional filtering
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to fetch staff records...');
    
    // Test connection
    const connection = await db.getConnection();
    console.log('Database connection successful for staff');
    connection.release();
    
    // Build query with optional filters
    let query = 'SELECT * FROM STAFF';
    const params = [];
    
    if (req.query.status) {
      query += ' WHERE STATUS = ?';
      params.push(req.query.status);
    }
    
    if (req.query.emp_type) {
      query += (params.length ? ' AND' : ' WHERE') + ' EMP_TYPE = ?';
      params.push(req.query.emp_type);
    }
    
    if (req.query.designation) {
      query += (params.length ? ' AND' : ' WHERE') + ' DESIGNATION LIKE ?';
      params.push(`%${req.query.designation}%`);
    }
    
    console.log('Executing staff query:', query, 'with params:', params);
    const [staff] = await db.query(query, params);
    console.log('Staff query successful, records found:', staff.length);
    
    res.json({
      success: true,
      count: staff.length,
      staff: staff.map(record => ({
        ...record,
        // Convert dates to more readable format if needed
        START_DATE: record.START_DATE.toISOString().split('T')[0],
        END_DATE: record.END_DATE ? record.END_DATE.toISOString().split('T')[0] : null
      }))
    });
    
  } catch (err) {
    console.error('Staff query error details:');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);
    
    res.status(500).json({
      error: 'Failed to fetch staff records',
      details: err.message,
      code: err.code
    });
  }
});

// Get single staff member by ID
router.get('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    console.log(`Fetching staff record for ID: ${staffId}`);
    
    const [staff] = await db.query(
      'SELECT * FROM STAFF WHERE STAFF_ID = ?', 
      [staffId]
    );
    
    if (staff.length === 0) {
      console.log(`No staff found with ID: ${staffId}`);
      return res.status(404).json({
        error: 'Staff not found',
        staffId
      });
    }
    
    console.log(`Successfully fetched staff record for ID: ${staffId}`);
    res.json({
      success: true,
      staff: {
        ...staff[0],
        START_DATE: staff[0].START_DATE.toISOString().split('T')[0],
        END_DATE: staff[0].END_DATE ? staff[0].END_DATE.toISOString().split('T')[0] : null
      }
    });
    
  } catch (err) {
    console.error(`Error fetching staff record for ID ${req.params.id}:`, err.message);
    res.status(500).json({
      error: 'Failed to fetch staff record',
      details: err.message
    });
  }
});

// Add new staff member
router.post('/', async (req, res) => {
  try {
    const {
      STAFF_ID,
      STAFF_NAME,
      STAFF_EMAIL,
      STATUS = 'Active', // Default value
      START_DATE = new Date().toISOString().split('T')[0], // Default to today
      END_DATE = null,
      DESIGNATION,
      EMP_TYPE
    } = req.body;
    
    console.log('Attempting to add new staff member:', {
      STAFF_ID,
      STAFF_NAME,
      STAFF_EMAIL,
      STATUS,
      START_DATE,
      END_DATE,
      DESIGNATION,
      EMP_TYPE
    });
    
    // Validation
    if (!STAFF_ID || !STAFF_NAME || !STAFF_EMAIL || !DESIGNATION || !EMP_TYPE) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['STAFF_ID', 'STAFF_NAME', 'STAFF_EMAIL', 'DESIGNATION', 'EMP_TYPE']
      });
    }
    
    if (END_DATE && new Date(END_DATE) < new Date(START_DATE)) {
      return res.status(400).json({
        error: 'End date cannot be before start date'
      });
    }
    
    const [result] = await db.query(
      `INSERT INTO STAFF 
       (STAFF_ID, STAFF_NAME, STAFF_EMAIL, STATUS, START_DATE, END_DATE, DESIGNATION, EMP_TYPE)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [STAFF_ID, STAFF_NAME, STAFF_EMAIL, STATUS, START_DATE, END_DATE, DESIGNATION, EMP_TYPE]
    );
    
    console.log('Staff member added successfully, ID:', STAFF_ID);
    res.status(201).json({
      message: 'Staff member added successfully',
      staffId: STAFF_ID,
      details: {
        name: STAFF_NAME,
        email: STAFF_EMAIL,
        designation: DESIGNATION,
        status: STATUS
      }
    });
    
  } catch (err) {
    console.error('Error adding staff member:', err.message);
    
    // Handle duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Staff ID already exists',
        existingId: req.body.STAFF_ID
      });
    }
    
    res.status(500).json({
      error: 'Failed to add staff member',
      details: err.message,
      code: err.code
    });
  }
});

// Update staff member
router.put('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const updates = req.body;
    
    console.log(`Attempting to update staff member ID: ${staffId} with:`, updates);
    
    // Validate updates
    if (updates.END_DATE && updates.START_DATE && 
        new Date(updates.END_DATE) < new Date(updates.START_DATE)) {
      return res.status(400).json({
        error: 'End date cannot be before start date'
      });
    }
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'STAFF_NAME', 'STAFF_EMAIL', 'STATUS', 
      'START_DATE', 'END_DATE', 'DESIGNATION', 'EMP_TYPE'
    ];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields provided for update'
      });
    }
    
    values.push(staffId);
    
    const [result] = await db.query(
      `UPDATE STAFF SET ${fields.join(', ')} WHERE STAFF_ID = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      console.log(`No staff found with ID: ${staffId} for update`);
      return res.status(404).json({
        error: 'Staff not found',
        staffId
      });
    }
    
    console.log(`Staff member ${staffId} updated successfully`);
    res.json({
      message: 'Staff member updated successfully',
      staffId,
      changes: result.changedRows
    });
    
  } catch (err) {
    console.error(`Error updating staff member ${req.params.id}:`, err.message);
    res.status(500).json({
      error: 'Failed to update staff member',
      details: err.message
    });
  }
});

// Delete staff member
router.delete('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    console.log(`Attempting to delete staff member ID: ${staffId}`);
    
    // First check if staff exists
    const [check] = await db.query(
      'SELECT STAFF_ID FROM STAFF WHERE STAFF_ID = ?',
      [staffId]
    );
    
    if (check.length === 0) {
      console.log(`No staff found with ID: ${staffId} for deletion`);
      return res.status(404).json({
        error: 'Staff not found',
        staffId
      });
    }
    
    // Check if staff has any active assignments (customize based on your schema)
    const [assignments] = await db.query(
      'SELECT COUNT(*) as active_assignments FROM STAFF_ASSIGNMENTS WHERE STAFF_ID = ? AND END_DATE IS NULL',
      [staffId]
    );
    
    if (assignments[0].active_assignments > 0) {
      return res.status(400).json({
        error: 'Cannot delete staff with active assignments',
        activeAssignments: assignments[0].active_assignments
      });
    }
    
    const [result] = await db.query(
      'DELETE FROM STAFF WHERE STAFF_ID = ?',
      [staffId]
    );
    
    console.log(`Staff member ${staffId} deleted successfully`);
    res.json({
      message: 'Staff member deleted successfully',
      staffId
    });
    
  } catch (err) {
    console.error(`Error deleting staff member ${req.params.id}:`, err.message);
    res.status(500).json({
      error: 'Failed to delete staff member',
      details: err.message
    });
  }
});

module.exports = router;