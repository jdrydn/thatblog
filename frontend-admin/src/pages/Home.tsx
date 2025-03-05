export default function Home() {
  const posts = [
    {
      title: 'Hello, world',
      excerpt: ['Foo bar'],
    },
    {
      title: 'Hello, world',
      excerpt: ['Foo bar'],
    },
    {
      title: 'Hello, world',
      excerpt: ['Foo bar'],
    },
    {
      title: 'Hello, world',
      excerpt: ['Foo bar'],
    },
    {
      title: 'Hello, world',
      excerpt: ['Foo bar'],
    },
    {
      title: 'Hello, world',
      excerpt: ['Foo bar'],
    },
  ];

  return (
    <div className="flex flex-col space-y-2 px-10">
      {posts.map((post) => (
        <div className="flex flex-col border-b py-4 px-1 lg:px-4">
          <div>{post.title}</div>
          <div>{post.title}</div>
        </div>
      ))}
    </div>
  );
}
