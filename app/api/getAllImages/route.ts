import Image from "@/lib/database/models/image.model";
import { connectDB as connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "@/lib/utils";
import {v2 as cloudinary} from 'cloudinary'


export default async function GET(req:Request) {
    // GET All IMAGES
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');
    const page = url.searchParams.get('page');
    const searchQuery = url.searchParams.get('searchQuery');
   
        try {
            await connectToDatabase();

            cloudinary.config({
                cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_CLOUD_API,
                api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
                secure: true,
            });

            let expression = 'folder=saas_project';

            if (searchQuery) {
                expression += ` AND ${searchQuery}`
            }

            const { resources } = await cloudinary.search
                .expression(expression)
                .execute();

            const resourceIds = resources.map((resource: any) => resource.public_id);

            let query = {};

            if(searchQuery) {
                query = {
                    publicId: {
                        $in: resourceIds
                    }
                }
            }

            const skipAmount = (Number(page) - 1) * (limit ? Number(limit) : 0);

            const images = await Image.find(query)
            .sort({ updatedAt: -1 })
            .skip(skipAmount)
            .limit(Number(limit) || 0)
            .populate('author', '_id firstName lastName clerkId');
        
            const totalImages = await Image.find(query).countDocuments();
            const savedImages = await Image.find().countDocuments();

            return {
                data: JSON.parse(JSON.stringify(images)),
                totalPage: Math.ceil(totalImages / Number(limit)),
                savedImages,
            }
        } catch (error) {
            handleError(error)
        }
    }

