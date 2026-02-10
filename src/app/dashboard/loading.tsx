import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className='flex flex-col gap-4 p-4 md:gap-8 md:p-8'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-[200px]' />
        <Skeleton className='h-10 w-[150px]' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-12' />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className='xl:col-span-2'>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-12 w-12 rounded-lg' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-[250px]' />
                <Skeleton className='h-3 w-[100px]' />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
