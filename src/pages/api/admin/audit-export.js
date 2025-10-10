import { dbConnect } from '../../../lib/dbConnect';
import AuditLog from '../../../models/AuditLog';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const audits = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .lean();

    // Convert to CSV format manually since json2csv might not be installed
    const csvHeaders = ['Timestamp', 'User', 'Action', 'Details'];
    const csvRows = audits.map(audit => [
      new Date(audit.timestamp).toISOString(),
      audit.user,
      audit.action,
      audit.details || ''
    ]);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.status(200).send(csvContent);

  } catch (err) {
    console.error('Error exporting audits:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 