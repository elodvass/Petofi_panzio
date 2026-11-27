function notFoundHandler(req, res) {
    res.status(404).json({ message: 'A keresett végpont nem található.' });
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err?.statusCode || err?.status || 500;

    if (statusCode < 500) {
        return res.status(statusCode).json({
            message: err.message || 'Hibás kérés.'
        });
    }

    console.error('Szerverhiba:', err);

    if (err?.statusPayload) {
        return res.status(statusCode).json(err.statusPayload);
    }

    return res.status(statusCode).json({
        message: err?.publicMessage || 'Belső szerverhiba történt.'
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
