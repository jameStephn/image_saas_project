"use client"
import React, { useState, useTransition, Dispatch, useEffect } from 'react'
import {z} from 'zod'
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import {  useForm } from "react-hook-form"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from '@/constants'
import { CustomField } from './CustomField'
import { AspectRatioKey, debounce, deepMergeObjects } from '@/lib/utils'
import MediaUploader from './MediaUploader'
import TransformedImage from './TransformedImage'
import { updateCredits } from '@/lib/actions/user.actions'
import { getCldImageUrl } from 'next-cloudinary'
import { addImage, updateImage } from '@/lib/actions/image.actions'
import { useRouter } from 'next/navigation'
import { InsufficientCreditsModal } from './InsufficientCreditsModal'
export const formSchema = z.object({
    title:z.string().nonempty(),
    aspectRatio: z.string().optional(),
    color:z.string().optional(),
    prompt:z.string().optional(),
    publicId: z.string(),
    _id: z.string().optional(),
})



const TransformationForm = ({action,data=null,userId,type,creditBalance,config=null}:TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);
  const router = useRouter();
  const [newTransformation, setnewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [isTransforming, setisTransforming] = useState(false);
  const [transformationConfig, settransformationConfig] = useState(config);
  const [isPending,startTransition ] = useTransition()
  const initialValues = data && action==='Update'?{
    title:data?.title,
    aspectRatio:data?.aspectRatio,
    color:data?.color,
    prompt:data?.prompt,
    publicId:data?.publicId,
    _id: data?._id
  }: defaultValues
  // define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });


const onInputChangeHandler = (field:string,value:string,type:TransformationTypeKey,onChangeField:(value:string)=>void)=>{
  debounce(()=>{
    setnewTransformation((prevState:any)=>({
      ...prevState,
      [type]:{
        ...prevState?.[type],
        [field==='prompt'?'prompt': 'to']:value
      }
    }))
  },1000)();
  return onChangeField(value)

}

  const onSubmit =async (data: z.infer<typeof formSchema>) => {
    setisSubmitting(true);
    if(data || image){
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig
      })
      const imageData ={
        title:data.title,
        publicId:image?.publicId,
        transformationType:type,
        width:image?.width,
        height:image?.height,
        secureURL:image?.secureUrl,
        transformationURL:transformationUrl,
        aspectRatio:data.aspectRatio,
        prompt:data.prompt,
        color:data.color,
        config: transformationConfig,
    }
    if(action==='Add'){
      try {
        const newImage = await addImage({
          image:imageData,
          userId,
          path:'/'
        })
        if(newImage){
          form.reset()
          setImage(data);
router.push(`/transformations/${newImage._id}`)
        }
      } catch (error) {
        console.log(error)
      }
  }
  if(action==='Update'){
    try {
      const updatedImage = await updateImage({
        image:{
          ...imageData,
          _id:data._id || '',
        },
        userId,
        path:`/transformations/${data._id}`
      
      })
      if(updatedImage){
       
router.push(`/transformations/${updatedImage._id}`)
      }
    } catch (error) {
      console.log(error)
    }
   
  };
}
setisSubmitting(false)
  }


    // todo: add a function to handle the onselect event
  const onSelectFieldHandler = (value:string,onChangeField:(value:string)=>void)=>{
 const imageSize = aspectRatioOptions[value as AspectRatioKey];
 setImage((prevState:any)=>({
    ...prevState,
    aspectRatio: imageSize.aspectRatio,
    width:imageSize.width,
    height:imageSize.height
 }))

 setnewTransformation(transformationType.config)
  return onChangeField(value)
  }
  const onTransformHandler = () => {
   setisTransforming(true)
   settransformationConfig(deepMergeObjects(newTransformation, transformationConfig) as Transformations)
   setnewTransformation(null)
   startTransition(async()=>{
    await updateCredits(userId,creditFee)
    
   })
  };
useEffect(()=>{
if(image && (type ==='restore' || type ==='removeBackground')){
  setnewTransformation(transformationType.config);
}
},[image,transformationType.config,type]);


  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {creditBalance <Math.abs(creditFee)&& <InsufficientCreditsModal/>}
      <CustomField 
        control={form.control}
        name="title"
        formLabel='Image Title'
        className='w-full'
        render={({field})=><Input {...field} className='input-field' />}
        
      />
      {type==='fill'&&(

        <CustomField 
        control={form.control}
            name="aspectRatio"
            formLabel='Aspect Ratio'
            className='w-full'
            render={({field})=><Select
            onValueChange={(value)=>onSelectFieldHandler(value,field.onChange)}
            value={field.value}
            >
            <SelectTrigger className="select-field">
              <SelectValue placeholder="Select Size" />
            </SelectTrigger>
            <SelectContent>
             {Object.keys(aspectRatioOptions).map((key)=>(<SelectItem key={key} value={key} className='select-items'>
              {aspectRatioOptions[key as AspectRatioKey].label}

             </SelectItem>))}
            </SelectContent>
          </Select>}
            />
          )}
{(type ==='recolor' || type ==='remove')&&(
<div className="prompt-field">
  <CustomField
  control={form.control}
  name='prompt'
  formLabel={
    type==='remove'?'Object to Removed':'Object to recolors'
  }
  className='w-full'
  render={({field})=><Input 
  value={field.value}
  className='input-field'
  onChange={(e)=>onInputChangeHandler('prompt',e.target.value,type,field.onChange)}
  />}

  />
  {type==='recolor'&&(
    <CustomField
    control={form.control}
    name='color'
    formLabel='Replacement Color'
className='w-full'
render={({field})=><Input
value={field.value}
className='input-field'
onChange={(e)=>onInputChangeHandler('color',e.target.value,'recolor',field.onChange)}
/>}
    />
  )}
</div>
)}

<div className="media-uploader-field">
  <CustomField
  control={form.control}
  name='publicId'
  className='flex size-full flex-col'
  render={({field})=>(
    <MediaUploader
    onValueChange={field.onChange}
    setImage={setImage}
    publicId={field.value}
    image={image}
    type={type}
    />
  )}
  />

  <TransformedImage
  image={image}
  type={type}
  title={form.getValues().title}
  isTransforming={isTransforming}
  setIsTransforming={setisTransforming}
  transformationConfig={transformationConfig}

  />
</div>


<div className="flex flex-col gap-4">
<Button type="button"
disabled={isSubmitting|| newTransformation===null}
onClick={onTransformHandler}
className="submit-button capitalize">
  {isTransforming ? 'Transforming.....' : 'Apply Transformation'}
  </Button>
  <Button type="submit"
disabled={isSubmitting}
onClick={onTransformHandler}
className="submit-button capitalize">
  {isSubmitting ? 'Submitting.....' : 'Save Image'}
  </Button>

</div>


    </form>
  </Form>
  )
}

export default TransformationForm