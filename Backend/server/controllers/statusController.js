const statusService = require('../services/statusService');

function getRoot(req, res) {
    res.json({ message: 'Petőfi Panzió API szerver fut.' });
}

async function getStatus(req, res, next) {
    try {
        const status = await statusService.getDatabaseStatus();
        res.json(status);
    } catch (error) {
        error.statusCode = 500;
        error.statusPayload = { status: 'error', message: error.message };
        next(error);
    }
}

module.exports = {
    getRoot,
    getStatus
};
