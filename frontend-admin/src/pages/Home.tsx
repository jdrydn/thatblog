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
    <div className="flex flex-col md:flex-row gap-2 px-3 md:px-10">
      <div className="flex flex-col shrink-0 py-4 px-1 md:w-64">
        <ul className="text-sm space-y-2">
          <li>
            <a className="text-blue-700 hover:underline" href="#">
              Create post
            </a>
          </li>
          <li>
            <hr />
          </li>
          <li>
            <a className="text-blue-700 hover:underline" href="#">
              Published posts
            </a>
          </li>
          <li>
            <a className="text-blue-700 hover:underline" href="#">
              Draft posts
            </a>
          </li>
          <li>
            <a className="text-blue-700 hover:underline" href="#">
              Archived posts
            </a>
          </li>
          <li>
            <hr />
          </li>
          <li>
            <a className="text-blue-700 hover:underline" href="/admin/settings">
              Settings
            </a>
          </li>
          <li>
            <hr />
          </li>
          <li>
            <strong>Hi James!</strong>
          </li>
          <li>
            <a className="text-blue-700 hover:underline" href="/admin/auth/logout">
              Sign out
            </a>
          </li>
        </ul>
      </div>
      <div className="flex flex-col px-1">
        <div className="flex flex-col gap-4 border-b py-4 px-1 lg:px-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-4 space-y-4">
              <h2 className="text-xl italic">No title</h2>
              <div className="text-sm">
                <p className="line-clamp-5 italic">No content</p>
              </div>
            </div>
            <div className="md:col-span-2 text-sm space-y-4">
              <dl className="divide-y divide-gray-100">
                <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-2 sm:px-0">
                  <dt className="text-sm/6 font-medium text-gray-900 sm:col-span-2">Status</dt>
                  <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                    <strong>Draft</strong>
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium text-gray-900 sm:col-span-2">Created At</dt>
                  <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">2025-01-01 09:00</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="flex flex-row gap-x-4 px-1">
            <a className="text-blue-700 hover:underline" href="/admin/editor">
              Edit
            </a>
          </div>
        </div>
        {posts.map((post) => (
          <div className="flex flex-col gap-4 border-b py-4 px-1 lg:px-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-4 space-y-4">
                <h2 className="text-xl">{post.title}</h2>
                <div className="text-sm">
                  <p className="line-clamp-5">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium, sem ut ultrices auctor, augue
                    ex ornare ante, et pellentesque urna sapien vitae ex. Proin pharetra urna nunc, in faucibus neque
                    porttitor quis. Praesent id iaculis ex. Aenean ut consequat nulla. Aliquam id pellentesque risus.
                    Donec venenatis blandit nisl, ut malesuada sem sodales et. Duis scelerisque orci nec sodales
                    eleifend. Etiam in dignissim magna. Nulla eget mi metus. Aliquam efficitur mattis feugiat. In
                    molestie feugiat nulla non vestibulum. Sed convallis lacinia urna sit amet porta. Donec euismod
                    egestas nunc eget dapibus. Duis rhoncus urna eget eros posuere malesuada.
                  </p>
                </div>
              </div>
              <div className="md:col-span-2 text-sm space-y-4">
                <dl className="divide-y divide-gray-100">
                  <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-2 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 sm:col-span-2">Status</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <strong>Published</strong>
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 sm:col-span-2">Published At</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">2025-01-01 09:00</dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 sm:col-span-2">Created At</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">2025-01-01 09:00</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="flex flex-row gap-x-4 px-1">
              <a className="text-blue-700 hover:underline" href="#">
                View
              </a>
              <a className="text-blue-700 hover:underline" href="/admin/editor">
                Edit
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
