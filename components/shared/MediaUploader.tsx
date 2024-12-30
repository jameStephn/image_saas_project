'use client'
import { useToast } from '@/hooks/use-toast'
import React, { Dispatch } from 'react'
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { dataUrl, getImageSize } from '@/lib/utils';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';
interface MediaUploaderProps {
    onValueChange: (value: any) => void;
    setImage: Dispatch<any>;
    publicId: string;
    image: any;
    type: string;
  }
const MediaUploader:React.FC<MediaUploaderProps> = ({ onValueChange, setImage, publicId, image, type }) => {

    const {toast}=useToast();
    const onUploadSuccessHandler=(result:any)=>{
        setImage((prevState:any)=>({
            ...prevState,
            publicId:result?.info?.public_id,
            width:result?.info?.width,
            height:result?.info?.height,
            secureUrl:result?.info?.secure_url
        }))
        onValueChange(result?.info?.public_id)
        toast({
            title:"Image uploaded successfully",
            description:"1 Credit was deducted from your account",
            duration:5000,
            className:"success-toast"
        })
    }
    const onUploadErrorHandler=()=>{
        toast({
            title:"Something went Wrong while uploading the image",
            description:"Please try again",
            duration:5000,
            className:"error-toast"
        })
    }
     
  return (
    <CldUploadWidget 
    uploadPreset='afaq_imaginify'
    options={{
        multiple:false,
        resourceType:'image',
        cloudName:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

    }}
    onSuccess={onUploadSuccessHandler}
    onError={onUploadErrorHandler}
    >
        {({open})=>(
            <div className="flex flex-col gap-4">
                <h3 className="h3-bold text-dark-600">
                    Orginal
                </h3>
{publicId?(
    <>
    <div className="cursor-pointer overflow-hidden rounded-[10px]">
        <CldImage
        width={getImageSize(type,image,'width')}
        height={getImageSize(type,image,'height')}
        src={publicId}
        alt='Image'
        sizes={"(max-width: 767px) 100vw"}
        placeholder={dataUrl as PlaceholderValue}
        className='media-uploader_cldImage'
        />
    </div>
    </>
):(<div className='media-uploader_cta'

onClick={()=>open()}>
<div className="media-uploader_cta-image">
    <Image
    src={'/assets/icons/add.svg'}
    alt='Add Image'
    width={24}
    height={24}
    />
</div>
    <p className='p-14-medium'>
        click here to upload image
    </p>
</div>
)}
            </div>
        )}
    </CldUploadWidget>
  )
}

export default MediaUploader