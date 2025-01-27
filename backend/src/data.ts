export interface Site {
  id: string;
  config?: {
    origin?: string;
    basePath?: string;
  };
  title?: string;
  meta?: Record<string, string | undefined>;
}

export const site: Site = {
  id: '0194a9bd-36b6-711b-8c1c-43171e0360ea',
  config: {
    origin: 'https://6kfms45oc8.execute-api.eu-west-2.amazonaws.com',
    basePath: '',
  },
  title: 'jdrydn',
  meta: {
    title: 'jdrydn',
  },
};

export interface Err {
  message: string;
  code?: string;
}

export const err: Err = {
  message: 'Page not found',
  code: 'NOT_FOUND',
};

export interface Page {
  id: string;
  title?: string;
  contents?: Array<Content>;
}

export const page = {
  id: '0194a9c1-d7e1-753a-8e5e-5515b6d46384',
  title: 'About me',
  contents: [
    {
      type: 'PLAIN_TEXT',
      value: 'Hello, world!',
    },
  ],
};

export interface Post {
  id: string;
  title?: string;
  contents?: Array<Content>;
}

export const postStatus: Post = {
  id: '0194a9c1-f8f6-75cc-ac40-1a4a9821480d',
  contents: [
    {
      type: 'PLAIN_TEXT',
      value: 'Hello, world!',
    },
  ],
};

export const postShort: Post = {
  id: '0194a9c2-1b85-7161-b481-5eccae332d63',
  title: 'Hello world',
  contents: [
    {
      type: 'PLAIN_TEXT',
      value: 'Hello, world!',
    },
  ],
};

export const postLong: Post = {
  id: '0194a9c2-3f35-774f-bdb4-3670c2a16e52',
  title: 'Hello world',
  contents: [
    {
      type: 'PLAIN_TEXT',
      value: 'Hello world 1',
    },
    {
      type: 'PLAIN_TEXT',
      value: 'Hello world 2',
    },
    {
      type: 'PLAIN_TEXT',
      value: 'Hello world 3',
    },
  ],
};

export interface PostList {
  data: Array<Post>;
}

export const posts: PostList = {
  data: [postStatus, postShort, postLong],
};

export type Content =
  | { type: 'PLAIN_TEXT'; value: string }
  | { type: 'MARKDOWN'; value: string }
  | { type: 'RICH_TEXT'; value: string };
