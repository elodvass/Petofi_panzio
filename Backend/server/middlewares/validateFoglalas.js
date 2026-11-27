const ENGEDELYEZETT_STATUSZOK = ['fuggoben', 'megerositve', 'lemondva'];

function validateCreateFoglalas(req, res, next) {
    const {
        felhasznalo_id,
        szoba_id,
        erkezes_datum,
        tavozas_datum,
        vendegek_szama,
        etkezesek
    } = req.body || {};

    const parsedUserId = Number(felhasznalo_id);
    const parsedRoomId = Number(szoba_id);
    const parsedGuests = Number(vendegek_szama);

    if (
        !Number.isInteger(parsedUserId) ||
        parsedUserId <= 0 ||
        !Number.isInteger(parsedRoomId) ||
        parsedRoomId <= 0 ||
        !erkezes_datum ||
        !tavozas_datum ||
        !Number.isInteger(parsedGuests) ||
        parsedGuests <= 0
    ) {
        return res.status(400).json({
            message: 'A foglaláshoz minden kötelező mezőt (felhasználó, szoba, érkezés, távozás, vendégek száma) helyesen meg kell adni!'
        });
    }

    if (etkezesek !== undefined && !Array.isArray(etkezesek)) {
        return res.status(400).json({
            message: 'Az étkezések mezőnek listának (tömbnek) kell lennie!'
        });
    }

    if (Array.isArray(etkezesek)) {
        for (const item of etkezesek) {
            if (!item || typeof item !== 'object' || !item.datum || item.etel_id === undefined || item.adag === undefined) {
                return res.status(400).json({
                    message: 'Minden étkezési tételnél kötelező a datum, etel_id és adag mező!'
                });
            }
        }
    }

    req.body.felhasznalo_id = parsedUserId;
    req.body.szoba_id = parsedRoomId;
    req.body.erkezes_datum = String(erkezes_datum).trim();
    req.body.tavozas_datum = String(tavozas_datum).trim();
    req.body.vendegek_szama = parsedGuests;
    req.body.etkezesek = Array.isArray(etkezesek) ? etkezesek : [];

    return next();
}

function validateFoglalasStatusz(req, res, next) {
    const { statusz } = req.body || {};
    if (!statusz || !ENGEDELYEZETT_STATUSZOK.includes(String(statusz))) {
        return res.status(400).json({
            message: `Érvénytelen státusz! Megengedett értékek: ${ENGEDELYEZETT_STATUSZOK.join(', ')}.`
        });
    }

    req.body.statusz = String(statusz);
    return next();
}

module.exports = {
    validateCreateFoglalas,
    validateFoglalasStatusz
};
