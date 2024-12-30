import Header from '@/components/shared/Header';
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const AddtransformationsPage = async ({ params }: SearchParamProps) => {
    const { type } = await params as { type: keyof typeof transformationTypes }; // Ensure proper destructuring
        const transformation = transformationTypes[type];
        const { userId } = await auth();
        if (!userId) {
            console.error("User not authenticated, redirecting to sign-in");
            redirect('/sign-in');
        }
        const user = await getUserById(userId);
        if (!user) throw new Error("User not found in database");

        return (
            <>
                <Header title={transformation.title} subTitle={transformation.subTitle} />
                <section className='mt-10'>
                    <TransformationForm
                        action="Add"
                        userId={user._id}
                        type={transformation.type as TransformationTypeKey}
                        creditBalance={user.creditBalance}
                    />
                </section>
            </>
        );
    
};

export default AddtransformationsPage;
