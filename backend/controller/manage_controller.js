import { prisma } from "../prisma/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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
    const currentPage = Number(req.query.current) || 1;
    const limit = 11;
    const offset = (currentPage - 1) * limit;

    const [wasteData, total] = await Promise.all([
        prisma.waste.findMany({
            skip: offset,
            take: limit,
            // อย่าลืมใส่ where: { isCorrect: false }
        }),
        prisma.waste.count({})
    ]);

    const wasteTypeLabels = ['ขยะอินทรีย์', 'ขยะอันตราย', 'ขยะทั่วไป', 'ขยะรีไซเคิล'];

    const transformedData = wasteData.map((item) => {
        const votes = item.Vote_wastetype;
        const totalVotes = item.Vote_wastetype.reduce((sum, val) => sum + val, 0);

        const labeledVotes = votes.map((count, index) => {
            const percent = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(2) : "0";
            return {
                label: wasteTypeLabels[index],
                count: count,
                percentage: percent
            };
        });
        const maxVote = Math.max(...votes)
        const agreementRate = ((maxVote/totalVotes)*100).toFixed(2)

        return {
            ...item,
            Vote_wastetype: labeledVotes,
            Total_Vote: totalVotes,
            Agreement_Rate:agreementRate
        };
    });

    const totalPage = Math.ceil(total / limit);

    res.status(200).json({
        wasteData: transformedData,
        totalPage: totalPage
    });
});