const etelRepository = require('../repositories/etelRepository');

const KATEGORIA_SORREND = {
    reggeli: 1,
    ebed: 2,
    vacsora: 3
};

async function getAllMenuItems() {
    const rows = await etelRepository.findAllOrderedById();

    return [...rows].sort((a, b) => {
        const rankA = KATEGORIA_SORREND[a.kategoria] ?? 4;
        const rankB = KATEGORIA_SORREND[b.kategoria] ?? 4;
        if (rankA !== rankB) return rankA - rankB;
        return a.id - b.id;
    });
}

module.exports = {
    getAllMenuItems
};
