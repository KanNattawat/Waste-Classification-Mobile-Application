import { prisma } from "../prisma/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Prisma } from '@prisma/client'

export const getUsers = asyncHandler(async (req, res) => {
    const currentPage = Number(req.query.current) || 1;
    const userName = req.query.username
    const limit = 11
    const offset = (currentPage - 1) * limit

    const [users, total] = await Promise.all(
        [
            prisma.user.findMany({
                skip: offset,
                take: limit,
                where: {
                    User_name: userName ? { contains: userName } : undefined
                }
            }),
            prisma.user.count({
                where: {
                    User_name: userName ? { contains: userName } : undefined
                }
            })
        ])

    console.log(total)


    const totalPage = Math.ceil(total / limit)
    console.log(totalPage)

    res.status(200).json(
        {
            user: users,
            totalPage: totalPage
        }
    );
})

export const editUser = asyncHandler(async (req, res) => {
    const { userName, email, fullName, identify } = req.body

    const userId = await prisma.user.findUnique({
        where: {
            User_name: identify
        }
    })

    console.log(userId.User_ID)

    const updateUser = await prisma.user.update({
        where: {
            User_ID: userId.User_ID
        },
        data: {
            Full_name: fullName,
            Email: email,
            User_name: userName
        }
    })
    console.log(updateUser);
    res.status(200).json(updateUser)
})


export const deleteUser = asyncHandler(async (req, res) => {
    const { identify } = req.body
    const deleteUser = await prisma.user.delete({
        where: {
            User_name: identify
        }
    })

    res.status(200).json(deleteUser)
})

export const getWaste = asyncHandler(async (req, res) => {
    const { current, minVote, minAgree, selectedType, dateRange } = req.query;
    const currentPage = Number(current) || 1
    const voteLimit = Number(minVote) || 0 //number
    const agreeLimit = Number(minAgree) || 0 //number
    const types = (selectedType && selectedType.length > 0) ? selectedType?.split(',').map(Number) : null; //3,1,2,4 // query

    const dateParts = (dateRange && dateRange.trim() !== '') ? dateRange?.split(',') : null; //query
    const dateFrom = dateParts !== null ? dateParts[0] : null; //2026-02-17 
    const dateTo = dateParts !== null ? dateParts[1] : null
    const limit = 11;
    const offset = (Number(currentPage) - 1) * limit;

    const dateFromFilter = dateFrom
        ? Prisma.sql`AND "Timestamp" >= CAST(${dateFrom} AS timestamp)`
        : Prisma.empty;

    const dateToFilter = dateTo
        ? Prisma.sql`AND "Timestamp" <= CAST(${dateTo} AS timestamp)`
        : Prisma.empty;

    const typesFilter = types
        ? Prisma.sql`AND "WasteType_ID" = ANY(${types}::int[])`
        : Prisma.empty;

    const [queryWasteData, countWasteData] = await Promise.all([
        prisma.$queryRaw`
            SELECT * FROM (
                SELECT *, 
                (SELECT COALESCE(SUM(s), 0) FROM UNNEST("Vote_wastetype") s) as total_vote,
                (SELECT COALESCE(MAX(m), 0) FROM UNNEST("Vote_wastetype") m) as max_vote
                FROM "Waste"
                WHERE "Is_correct" = false
                ${typesFilter}
                ${dateFromFilter}
                ${dateToFilter}
            ) as subquery
            WHERE total_vote >= ${voteLimit}
            AND (CASE WHEN total_vote > 0 THEN (max_vote::float / total_vote::float) * 100 ELSE 0 END) >= ${agreeLimit}
            ORDER BY "Timestamp" DESC
            LIMIT ${limit} OFFSET ${offset}
        `,
        prisma.$queryRaw`
            SELECT COUNT(*)::int as count FROM (
                SELECT 
                (SELECT COALESCE(SUM(s), 0) FROM UNNEST("Vote_wastetype") s) as total_vote,
                (SELECT COALESCE(MAX(m), 0) FROM UNNEST("Vote_wastetype") m) as max_vote
                FROM "Waste"
                WHERE "Is_correct" = false
                ${typesFilter}
                ${dateFromFilter}
                ${dateToFilter}
            ) as subquery
            WHERE total_vote >= ${voteLimit}
            AND (CASE WHEN total_vote > 0 THEN (max_vote::float / total_vote::float) * 100 ELSE 0 END) >= ${agreeLimit}
        `
    ])
    const totalData = countWasteData[0].count


    const wasteTypeLabels = ['ขยะอินทรีย์', 'ขยะอันตราย', 'ขยะทั่วไป', 'ขยะรีไซเคิล'];
    const transformedData = queryWasteData.map((item) => {
        const votes = item.Vote_wastetype;
        const totalVotes = Number(item.total_vote)
        const maxVote = item.max_vote
        const agreementRate = ((maxVote/totalVotes)*100).toFixed(2)
        console.log('maxVote:', maxVote, ' totalVotes:', totalVotes)


        const labeledVotes = votes.map((count, index) => {
            const percent = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : "0";
            return {
                label: wasteTypeLabels[index],
                count: count,
                percentage: percent
            };
        });


        return {
            ...item,
            total_vote: totalVotes,
            Vote_wastetype: labeledVotes,
            Total_Vote: totalVotes,
            Agreement_Rate: agreementRate
        };
    });
    const totalPage =  totalData > 0 ?Math.ceil(totalData / limit) : 1;
    console.log(totalPage)

    res.status(200).json({
        wasteData: transformedData,
        totalPage: totalPage
    });

});