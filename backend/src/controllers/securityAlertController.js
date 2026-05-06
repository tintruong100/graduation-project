import securityAlertService from '../services/securityAlertService.js';

const getAlerts = async (req, res) => {
    try {
        const data = await securityAlertService.getAllAlerts();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


export default { getAlerts };