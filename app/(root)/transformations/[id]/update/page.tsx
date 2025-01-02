import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { getImageById } from "@/lib/actions/image.actions";
import { auth } from "@clerk/nextjs/server";

// Declare the SearchParamProps type
type SearchParamProps = {
  params?: Promise<{ id: string; type: TransformationTypeKey }> | undefined;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Page = async ({ params }: SearchParamProps) => {
  // Ensure params is resolved before accessing its properties
  const resolvedParams = params ? await params : { id: '', type: 'restore' }; // Add fallback if params is undefined
  
  const { id } = resolvedParams;
  
  if (!id) redirect("/");

  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const image = await getImageById(id);

  const transformation = transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subTitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;
