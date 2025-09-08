/**
 * Vercel deploy entry handler, for serverless deployment
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Simple health check for now
  if (req.url === '/api/health') {
    return res.status(200).json({
      success: true,
      message: 'MAgent API is running on Vercel',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default response
  return res.status(200).json({
    success: true,
    message: 'MAgent - AI心理健康诊断助手',
    version: '1.0.0',
    status: 'deployed'
  });
}