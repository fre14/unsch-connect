import { PostCard, PostProps } from '@/components/post-card';

const communityPosts: PostProps[] = [
  {
    author: { name: 'Mariela Quispe', username: '@mari_q', avatarId: 'user-avatar-3' },
    time: 'hace 30 min',
    content: 'Viendo el atardecer desde la facultad de Ciencias Sociales. ¡Qué vista! 🌇',
    imageId: 'post-image-sunset',
    imageAlt: 'Sunset view from the university',
    stats: { likes: 58, comments: 6, reposts: 3 },
  },
  {
    author: { name: 'Luis Fernando', username: '@lufer', avatarId: 'user-avatar-4' },
    time: 'hace 1 hora',
    content: '¿Alguien sabe si ya están disponibles las notas del parcial de Estadística? La ansiedad me consume. 😬',
    stats: { likes: 15, comments: 9, reposts: 1 },
  },
  {
    author: { name: 'Ana Sofía', username: '@anasofia', avatarId: 'user-avatar-1' },
    time: 'hace 5 horas',
    content: '¡Emocionada por el inicio del nuevo ciclo! ¿Alguien más en Cálculo III? Busco grupo de estudio. 📚 #UNSCH #NuevoCiclo',
    stats: { likes: 25, comments: 4, reposts: 2 },
  },
];

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="font-headline text-3xl font-bold mb-6">Comunidad Estudiantil</h1>
        <div className="space-y-6">
        {communityPosts.map((post, index) => (
            <PostCard key={index} {...post} />
        ))}
        </div>
    </div>
  );
}
