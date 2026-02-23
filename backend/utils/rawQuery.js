import { Prisma } from '@prisma/client'


export const transform = async (minVote, minAgree, selectedType, dateRange) => {
    const voteLimit = Number(minVote) || 0 //number
    const agreeLimit = Number(minAgree) || 0 //number
    const types = (selectedType && selectedType.length > 0) ? selectedType?.split(',').map(Number) : null; //3,1,2,4 

    const dateParts = (dateRange && dateRange.trim() !== '') ? dateRange?.split(',') : null;
    const dateFrom = dateParts !== null ? dateParts[0] : null; //2026-02-17 
    const dateTo = dateParts !== null ? dateParts[1] : null

    return {voteLimit, agreeLimit, types, dateFrom, dateTo}
}

export const buildWasteFilters = (types, dateFrom, dateTo) => {
    const typesFilter = types
        ? Prisma.sql`AND "WasteType_ID" = ANY(${types}::int[])`
        : Prisma.empty;

    const dateFromFilter = dateFrom
        ? Prisma.sql`AND "Timestamp" >= CAST(${dateFrom} AS timestamp)`
        : Prisma.empty;

    const dateToFilter = dateTo
        ? Prisma.sql`AND "Timestamp" <= CAST(${dateTo} AS timestamp)`
        : Prisma.empty;

    return Prisma.sql`${typesFilter} ${dateFromFilter} ${dateToFilter}`;
};

export const getBaseWasteQuery = (filters, voteLimit, agreeLimit) => {
    return Prisma.sql`
        SELECT * FROM (
            SELECT *, 
            (SELECT COALESCE(SUM(s), 0) FROM UNNEST("Vote_wastetype") s) as total_vote,
            (SELECT COALESCE(MAX(m), 0) FROM UNNEST("Vote_wastetype") m) as max_vote
            FROM "Waste"
            WHERE "Is_correct" = false
            ${filters}
        ) as subquery
        WHERE total_vote >= ${voteLimit}
        AND (CASE WHEN total_vote > 0 THEN (max_vote::float / total_vote::float) * 100 ELSE 0 END) >= ${agreeLimit}
    `;
};