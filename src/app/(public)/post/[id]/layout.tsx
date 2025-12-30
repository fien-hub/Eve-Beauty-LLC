import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: post } = await supabase
    .from('portfolio_items')
    .select(`
      id, image_url, caption,
      provider:provider_profiles!portfolio_items_provider_id_fkey(
        business_name
      )
    `)
    .eq('id', id)
    .single();

  const provider = Array.isArray(post?.provider) ? post.provider[0] : post?.provider;
  const title = provider?.business_name
    ? `${provider.business_name} on Eve Beauty`
    : 'Post | Eve Beauty';
  const description = post?.caption || `Check out this amazing look on Eve Beauty - the beauty services marketplace`;
  const imageUrl = post?.image_url || 'https://evebeauty.app/og-default.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: description,
        },
      ],
      siteName: 'Eve Beauty',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function PostLayout({ children }: Props) {
  return <>{children}</>;
}

