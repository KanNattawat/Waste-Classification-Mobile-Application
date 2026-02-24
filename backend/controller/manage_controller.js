import { prisma } from "../prisma/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { transform, buildWasteFilters, getBaseWasteQuery } from '../utils/rawQuery.js'
import { s3 } from "../utils/s3.js"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() }).single('Image_path');

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
    const { voteLimit, agreeLimit, types, dateFrom, dateTo } = await transform(minVote, minAgree, selectedType, dateRange)
    const currentPage = Number(current) || 1
    const limit = 11;
    const offset = (Number(currentPage) - 1) * limit;

    const filters = buildWasteFilters(types, dateFrom, dateTo)
    const baseQuery = getBaseWasteQuery(filters, voteLimit, agreeLimit)
    const [queryWasteData, countWasteData] = await Promise.all([
        prisma.$queryRaw`${baseQuery} ORDER BY "Timestamp" DESC LIMIT ${limit} OFFSET ${offset}`,
        prisma.$queryRaw`SELECT COUNT(*)::int as count FROM (${baseQuery}) as total`
    ])
    const totalData = countWasteData[0].count


    const wasteTypeLabels = ['ขยะอินทรีย์', 'ขยะอันตราย', 'ขยะทั่วไป', 'ขยะรีไซเคิล'];
    const transformedData = queryWasteData.map((item) => {
        const votes = item.Vote_wastetype;
        const totalVotes = Number(item.total_vote)
        const maxVote = item.max_vote
        const agreementRate = ((maxVote / totalVotes) * 100).toFixed(2)
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
    const totalPage = totalData > 0 ? Math.ceil(totalData / limit) : 1;
    console.log(totalPage)

    res.status(200).json({
        wasteData: transformedData,
        totalPage: totalPage
    });
});


export const getS3MultiDownloadPresigned = asyncHandler(async (req, res) => {
    const { minVote, minAgree, selectedTypes, dateRange } = req.query;
    const { voteLimit, agreeLimit, types, dateFrom, dateTo } = await transform(minVote, minAgree, selectedTypes, dateRange)
    const filters = buildWasteFilters(types, dateFrom, dateTo)
    const baseQuery = getBaseWasteQuery(filters, voteLimit, agreeLimit)
    const queryWasteData = await prisma.$queryRaw`${baseQuery} ORDER BY "Timestamp" DESC`

    if (queryWasteData.length > 50) return res.status(400).json({ msg: "Data must not over 50." })

    const zipName = `exports/waste-export-${Date.now()}.zip`;
    const passThrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(passThrough);
    const parallelUploads3 = new Upload({
        client: s3,
        params: {
            Bucket: process.env.S3_BUCKET,
            Key: zipName,
            Body: passThrough,
            ContentType: 'application/zip'
        }
    });
    

    for (const item of queryWasteData) {
        const mostVote = Math.max(...item.Vote_wastetype);
        const mostVoteIndex = item.Vote_wastetype.indexOf(mostVote)
        const mapping = ['Compostable waste', 'Hazardous waste', 'General waste', 'Recyclable waste'];
        const folderName = mapping[mostVoteIndex];
        try {
            const getObjCommand = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: item.Image_path
            })
            const response = await s3.send(getObjCommand)
            archive.append(response.Body, { name: `${folderName}/${item.Image_path.split('/').pop()}` });
        } catch (error) {
            console.error(`Failed to add file ${item.Image_path}`, error);
        }
    }

    await archive.finalize()
    await parallelUploads3.done();

    const downloadCommand = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: zipName
    })
    const presignedUrl = await getSignedUrl(s3, downloadCommand, { expiresIn: 3600 });

    res.status(200).json({ url: presignedUrl })
})

export const getPointShops = asyncHandler(async (req, res) => {
    const items = await prisma.pointShop.findMany({
        orderBy: {
            Item_ID: "asc"
        }
    });

    res.status(200).json(items);
});

export const getPointShopById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await prisma.pointShop.findUnique({
        where: {
            Item_ID: Number(id)
        }
    });

    if (!item) {
        return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(item);
});

export const createPointShops = asyncHandler(async (req, res) => {
    // 🌟 ดักจับ FormData ตรงนี้ก่อน เพื่อป้องกัน Error req.body is undefined
    await new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // ใส่ || {} ไว้กันเหนียว ในกรณีที่ข้อมูลว่างเปล่า
    const { Item_name, Usage_Limit, Point_Usage, Expire_Date } = req.body || {};
    const file = req.file; 

    if (!Item_name || !Usage_Limit || !Point_Usage || !Expire_Date || !file) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลและอัปโหลดรูปภาพให้ครบถ้วน" });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `pointshop/${uniqueSuffix}-${file.originalname.replace(/\s+/g, '-')}`;

    const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const region = process.env.AWS_REGION || 'ap-southeast-1';
    const Image_path = `https://${process.env.S3_BUCKET}.s3.${region}.amazonaws.com/${fileName}`;

    const item = await prisma.pointShop.create({
        data: {
            Item_name,
            Usage_Limit: Number(Usage_Limit),
            Point_Usage: Number(Point_Usage),
            Expire_Date: new Date(Expire_Date),
            Image_path: Image_path
        }
    });

    res.status(201).json({
        msg: "สร้างสินค้าเรียบร้อย",
        item
    });
});

export const updatePointShop = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 🌟 ดักจับ FormData ตรงนี้ก่อนเช่นกัน
    await new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    const { Item_name, Usage_Limit, Point_Usage, Expire_Date } = req.body || {};
    const file = req.file; 

    const existing = await prisma.pointShop.findUnique({
        where: { Item_ID: Number(id) }
    });

    if (!existing) {
        return res.status(404).json({ error: "Item not found" });
    }

    let Image_path = existing.Image_path;

    if (file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `pointshop/${uniqueSuffix}-${file.originalname.replace(/\s+/g, '-')}`;

        const uploadParams = {
            Bucket: process.env.S3_BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        
        const region = process.env.AWS_REGION || 'ap-southeast-1';
        Image_path = `https://${process.env.S3_BUCKET}.s3.${region}.amazonaws.com/${fileName}`;
    }

    const updated = await prisma.pointShop.update({
        where: { Item_ID: Number(id) },
        data: {
            Item_name,
            Usage_Limit: Number(Usage_Limit),
            Point_Usage: Number(Point_Usage),
            Expire_Date: new Date(Expire_Date),
            Image_path: Image_path
        }
    });

    res.status(200).json({
        msg: "อัปเดตสำเร็จ",
        item: updated
    });
});

export const deletePointShop = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.pointShop.delete({
        where: { Item_ID: Number(id) }
    });

    res.status(200).json({
        msg: "ลบสำเร็จ"
    });
});